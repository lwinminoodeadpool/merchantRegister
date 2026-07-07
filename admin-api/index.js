const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    },
    body: JSON.stringify(body)
});

const verifyToken = (event, JWT_SECRET) => {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: true, response: buildResponse(401, { message: 'Unauthorized: Missing token' }) };
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { error: false, decoded };
    } catch (err) {
        return { error: true, response: buildResponse(403, { message: 'Forbidden: Invalid or expired token' }) };
    }
};

exports.handler = async (event, context) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        const method = event.requestContext?.http?.method || event.httpMethod;

        // --- CORS Preflight ---
        if (method === 'OPTIONS') return buildResponse(200, {});

        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-testing';

        const resourceParam = event.queryStringParameters?.resource;
        
        let targetResource = resourceParam;
        if (!targetResource) {
            if (method === 'POST') targetResource = 'login';
            else targetResource = 'merchants';
        }

        // --- Route: Login ---
        if (targetResource === 'login' && method === 'POST') {
            try {
                const body = JSON.parse(event.body || "{}");
                const { username, password } = body;

                let db = await connectToDatabase();
                const usersCollection = db.collection('users');

                // Seed admin if the admin user doesn't exist
                const adminUser = await usersCollection.findOne({ username: ADMIN_USERNAME });
                if (!adminUser) {
                    const seedAdminPass = await bcrypt.hash(ADMIN_PASSWORD, 10);
                    await usersCollection.insertOne({
                        username: ADMIN_USERNAME,
                        password: seedAdminPass,
                        role: 'admin',
                        createdAt: new Date()
                    });
                }

                const user = await usersCollection.findOne({ username });
                if (user && await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign({ id: user._id.toString(), role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
                    return buildResponse(200, { message: 'Login successful', token, role: user.role, id: user._id.toString() });
                }
                
                return buildResponse(401, { message: 'Invalid credentials' });
            } catch (e) {
                return buildResponse(400, { message: 'Bad request format or server error', error: e.message });
            }
        }

        // --- Route: Users CRUD ---
        if (targetResource === 'users') {
            const tokenResult = verifyToken(event, JWT_SECRET);
            if (tokenResult.error) return tokenResult.response;
            const decoded = tokenResult.decoded;

            if (decoded.role !== 'admin') {
                return buildResponse(403, { message: 'Forbidden: Admin access required' });
            }

            let db = await connectToDatabase();
            const collection = db.collection('users');

            if (method === 'GET') {
                const users = await collection.find({}, { projection: { password: 0 } }).toArray();
                return buildResponse(200, { data: users });
            }

            if (method === 'POST') {
                const body = JSON.parse(event.body || "{}");
                
                // Workaround for API Gateway CORS blocking DELETE methods
                if (body.actionType === 'delete') {
                    const { id } = body;
                    if (!id) return buildResponse(400, { message: 'User ID required' });
                    if (id === decoded.id) return buildResponse(400, { message: 'Cannot delete your own account' });
                    await collection.deleteOne({ _id: new ObjectId(id) });
                    return buildResponse(200, { message: 'User deleted successfully' });
                }

                if (!body.username || !body.password || !body.role) {
                    return buildResponse(400, { message: 'Missing required fields' });
                }
                const existing = await collection.findOne({ username: body.username });
                if (existing) return buildResponse(400, { message: 'Username already exists' });
                
                const hashedPassword = await bcrypt.hash(body.password, 10);
                await collection.insertOne({
                    username: body.username,
                    password: hashedPassword,
                    role: body.role,
                    createdAt: new Date()
                });
                return buildResponse(201, { message: 'User created successfully' });
            }
        }

        // --- Route: Merchants ---
        if (targetResource === 'merchants') {
            const tokenResult = verifyToken(event, JWT_SECRET);
            if (tokenResult.error) return tokenResult.response;
            const decoded = tokenResult.decoded;

            let db = await connectToDatabase();
            const collection = db.collection('merchants');

            if (method === 'GET') {
                let query = {};
                if (decoded.role !== 'admin') {
                    query = { assignedTo: decoded.id };
                }

                const merchants = await collection.find(query).sort({ createdAt: -1 }).toArray();

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
            }

            if (method === 'POST') {
                const body = JSON.parse(event.body || "{}");
                if (!body.id) return buildResponse(400, { message: 'Missing merchant id' });

                const actionType = body.actionType || 'status'; 

                if (actionType === 'assign') {
                    if (decoded.role !== 'admin') return buildResponse(403, { message: 'Forbidden' });
                    await collection.updateOne(
                        { _id: new ObjectId(body.id) },
                        { $set: { assignedTo: body.assignedTo } } // assignedTo is the user _id
                    );
                    return buildResponse(200, { message: 'Assigned successfully' });
                }

                if (actionType === 'status') {
                    if (decoded.role !== 'admin') {
                        const merchant = await collection.findOne({ _id: new ObjectId(body.id) });
                        if (!merchant || merchant.assignedTo !== decoded.id) {
                            return buildResponse(403, { message: 'Forbidden: Application not assigned to you' });
                        }
                    }

                    const result = await collection.updateOne(
                        { _id: new ObjectId(body.id) },
                        { $set: { status: body.status } }
                    );
                    if (result.matchedCount === 0) return buildResponse(404, { message: 'Merchant not found' });
                    return buildResponse(200, { message: 'Status updated successfully' });
                }
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
