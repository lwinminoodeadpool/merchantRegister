const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const MONGODB_URI = process.env.MONGODB_URI;
    const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'merchant_db';
    if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedDb = client.db(MONGODB_DB_NAME);
    return cachedDb;
}

async function generateSignedUrl(fileUrl) {
    try {
        let S3Client, GetObjectCommand, getSignedUrl;
        try {
            const clientS3 = require('@aws-sdk/client-s3');
            S3Client = clientS3.S3Client;
            GetObjectCommand = clientS3.GetObjectCommand;
            const presigner = require('@aws-sdk/s3-request-presigner');
            getSignedUrl = presigner.getSignedUrl;
        } catch (requireErr) {
            console.error("Missing AWS SDK V3 Modules in Lambda:", requireErr);
            return fileUrl + "#error-missing-sdk"; // Fallback with a flag
        }

        const urlObj = new URL(fileUrl);
        const match = urlObj.hostname.match(/^(.+)\.s3\.(.+)\.amazonaws\.com$/);
        if (!match) return fileUrl; // Fallback

        const bucket = match[1];
        const region = match[2];
        const key = decodeURIComponent(urlObj.pathname.substring(1));

        const s3 = new S3Client({ region });
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        // Generate a URL valid for 1 hour
        return await getSignedUrl(s3, command, { expiresIn: 3600 });
    } catch (err) {
        console.error("Signing error:", err);
        return fileUrl;
    }
}

const buildResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT'
    },
    body: JSON.stringify(body)
});

exports.handler = async (event, context) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        const method = event.requestContext?.http?.method || event.httpMethod;
        const path = event.requestContext?.http?.path || event.path;

        // --- CORS Preflight ---
        if (method === 'OPTIONS') return buildResponse(200, {});

        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-testing';

        // --- Route: POST (Login) ---
        if (method === 'POST') {
            try {
                const body = JSON.parse(event.body || "{}");
                if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
                    const token = jwt.sign({ id: 'admin', role: 'root' }, JWT_SECRET, { expiresIn: '12h' });
                    return buildResponse(200, { message: 'Login successful', token });
                }
                return buildResponse(401, { message: 'Invalid credentials' });
            } catch (e) {
                return buildResponse(400, { message: 'Bad request format' });
            }
        }

        // --- Route: GET (Fetch Merchants) ---
        if (method === 'GET') {
            // Enforce JWT Auth
            const authHeader = event.headers?.Authorization || event.headers?.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return buildResponse(401, { message: 'Unauthorized: Missing token' });
            }

            const token = authHeader.split(' ')[1];
            try {
                jwt.verify(token, JWT_SECRET);
            } catch (err) {
                return buildResponse(403, { message: 'Forbidden: Invalid or expired token' });
            }

            // Fetch Data
            try {
                let db;
                try {
                    db = await connectToDatabase();
                } catch (dbErr) {
                    return buildResponse(500, { message: 'Database Connection Error', error: dbErr.message, stack: dbErr.stack });
                }
                const collection = db.collection('merchants');
                // Fetch all merchants, sort by newest first
                const merchants = await collection.find({}).sort({ createdAt: -1 }).toArray();

                // Inject Signed URLs for any documents
                for (let merchant of merchants) {
                    if (merchant.documents && merchant.documents.length > 0) {
                        for (let doc of merchant.documents) {
                            if (doc.url) {
                                doc.url = await generateSignedUrl(doc.url);
                            }
                        }
                    }
                }

                return buildResponse(200, { data: merchants });
            } catch (error) {
                console.error('Database error:', error);
                return buildResponse(500, { message: 'Data retrieval failed', error: error.message, stack: error.stack });
            }
        }

        // --- Route: PUT (Update Merchant Status) ---
        if (method === 'PUT') {
            // Enforce JWT Auth
            const authHeader = event.headers?.Authorization || event.headers?.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return buildResponse(401, { message: 'Unauthorized: Missing token' });
            }

            const token = authHeader.split(' ')[1];
            try {
                jwt.verify(token, JWT_SECRET);
            } catch (err) {
                return buildResponse(403, { message: 'Forbidden: Invalid or expired token' });
            }

            try {
                const body = JSON.parse(event.body || "{}");
                if (!body.id || !body.status) {
                    return buildResponse(400, { message: 'Missing id or status in request body' });
                }

                let db;
                try {
                    db = await connectToDatabase();
                } catch (dbErr) {
                    return buildResponse(500, { message: 'Database Connection Error', error: dbErr.message });
                }

                const collection = db.collection('merchants');
                const result = await collection.updateOne(
                    { _id: new ObjectId(body.id) },
                    { $set: { status: body.status } }
                );

                if (result.matchedCount === 0) {
                    return buildResponse(404, { message: 'Merchant not found' });
                }

                return buildResponse(200, { message: 'Status updated successfully' });
            } catch (error) {
                console.error('Update error:', error);
                return buildResponse(500, { message: 'Status update failed', error: error.message });
            }
        }

        return buildResponse(404, { message: 'Route not found' });
    } catch (globalError) {
        console.error("Fatal Lambda Crash:", globalError);
        return buildResponse(500, {
            message: 'Fatal Lambda Crash',
            error: globalError.message,
            stack: globalError.stack
        });
    }
};
