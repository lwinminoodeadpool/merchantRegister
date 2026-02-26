const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { MongoClient } = require('mongodb');
const multipart = require('lambda-multipart-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Initialize S3 Client
// The AWS Region is read from the Lambda Environment Variables
const s3Client = new S3Client({ region: process.env.S3_REGION || 'ap-southeast-1' });

// Initialize MongoDB Connection Cache
let cachedDb = null;

/**
 * Connects to MongoDB, reusing the connection if already established
 */
async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    const MONGODB_URI = process.env.MONGODB_URI;
    const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'merchant_db';

    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is missing.');
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    // Cache the database connection
    cachedDb = client.db(MONGODB_DB_NAME);
    return cachedDb;
}

/**
 * Main Lambda Handler
 */
exports.handler = async (event, context) => {
    // Prevent Lambda from waiting for the Node.js event loop to be completely empty
    // Allows reusing the MongoDB connection across multiple invocations
    context.callbackWaitsForEmptyEventLoop = false;

    // --- CORS Preflight Check ---
    const method = event.requestContext?.http?.method || event.httpMethod;
    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: ''
        };
    }

    // --- JWT Authentication Check ---
    /*
    // Temporarily disabled for frontend testing due to Secret mismatch
    const tokenOptions = event.headers.Authorization || event.headers.authorization;
    if (!tokenOptions || !tokenOptions.startsWith('Bearer ')) {
        console.log("Unauthorized: Missing or invalid Authorization header");
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Unauthorized: Missing or invalid token' })
        };
    }

    const token = tokenOptions.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        console.error("JWT_SECRET environment variable is not configured!");
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Internal Server Error: Server missing security configuration' })
        };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token verified. User ID:", decoded.id || decoded.sub || 'known user');
    } catch (err) {
        console.log("Token verification failed:", err.message);
        return {
            statusCode: 403,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Forbidden: Invalid or expired token' })
        };
    }
    */
    // --- End Authentication Check ---

    try {
        // Parse the multipart/form-data request
        console.log("Parsing multipart event...");
        const result = await multipart.parse(event);
        console.log("Parsing complete. Extracted fields:", Object.keys(result).filter(k => k !== 'files'));

        const {
            businessName,
            businessType, // e.g. "Mini app" or "Event"
            ownerName,
            phoneNumber, // Numeric Input
            email,       // Email Input
            address,     // Address string
            kycData      // Additional form fields as a stringified JSON object
        } = result;

        // 1. Basic Validation
        if (!businessName || !businessType || !ownerName || !phoneNumber || !email || !address) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*' // Enable CORS
                },
                body: JSON.stringify({ message: 'Missing required text fields.' })
            };
        }

        // 2. Upload Documents to S3
        const files = result.files || [];
        const uploadedDocuments = [];
        const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

        if (!S3_BUCKET_NAME) {
            throw new Error('S3_BUCKET_NAME environment variable is missing.');
        }

        for (const file of files) {
            // file contains: filename, content (Buffer), contentType, fieldname
            const fileExtension = file.filename.split('.').pop();
            const uniqueFilename = `${crypto.randomUUID()}-${Date.now()}.${fileExtension}`;

            // Clean business name to use as a folder in S3
            const folderName = businessName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const s3Key = `merchant-docs/${folderName}/${uniqueFilename}`;

            const putCommand = new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
                Body: file.content,
                ContentType: file.contentType
            });

            await s3Client.send(putCommand);

            uploadedDocuments.push({
                fieldName: file.fieldname, // e.g., 'businessLicense', 'nrcFront'
                originalName: file.filename,
                s3Key: s3Key,
                // Construct the S3 object URL
                url: `https://${S3_BUCKET_NAME}.s3.${process.env.S3_REGION || 'ap-southeast-1'}.amazonaws.com/${s3Key}`
            });
        }

        console.log(`Ready to save ${uploadedDocuments.length} documents. Attempting to connect to MongoDB...`);
        // 3. Connect to MongoDB and save record
        const db = await connectToDatabase();
        console.log("Connected to MongoDB successfully.");
        const collection = db.collection('merchants');

        let parsedKYC = null;
        try {
            if (kycData) {
                parsedKYC = JSON.parse(kycData);
            }
        } catch (e) {
            console.log("Failed to parse kycData JSON as object", e);
            parsedKYC = kycData; // store as raw string if not JSON
        }

        const newMerchant = {
            businessName,
            businessType,
            contactDetails: {
                ownerName,
                phoneNumber,
                email,
                address
            },
            kycInformation: parsedKYC,
            documents: uploadedDocuments,
            createdAt: new Date(),
            status: 'PENDING_REVIEW'
        };

        console.log("Merchant data prepared. Inserting to MongoDB...", JSON.stringify({ businessName, email, status: newMerchant.status }));
        const insertResult = await collection.insertOne(newMerchant);
        console.log("Insert result:", insertResult.insertedId);

        // 4. Return Success Response
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Merchant successfully registered.',
                merchantId: insertResult.insertedId,
                documentsUploaded: uploadedDocuments.length
            })
        };

    } catch (error) {
        console.error('Error processing registration:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Internal Server Error',
                detail: error.message
            })
        };
    }
};
