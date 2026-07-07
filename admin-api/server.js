require('dotenv').config(); // Load environment variables from .env if present

const express = require('express');
const cors = require('cors');
const { handler } = require('./index');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses application/json

// Local Express route that simulates AWS Lambda API Gateway payload
app.use(async (req, res) => {
    // Construct the event object exactly as AWS API Gateway passes it
    const event = {
        requestContext: {
            http: {
                method: req.method,
                path: req.path
            }
        },
        httpMethod: req.method,
        path: req.path,
        queryStringParameters: req.query,
        headers: req.headers,
        body: (req.body && Object.keys(req.body).length > 0) ? JSON.stringify(req.body) : "{}"
    };

    const context = {};

    try {
        // Call our Lambda handler function locally
        const result = await handler(event, context);

        // Parse and send the response back
        res.status(result.statusCode);
        if (result.headers) {
            for (const [key, value] of Object.entries(result.headers)) {
                res.setHeader(key, value);
            }
        }
        
        // Return body. If it's a JSON string, try to parse it so Express formats it nicely,
        // otherwise just send it as is.
        try {
            res.send(JSON.parse(result.body));
        } catch(e) {
            res.send(result.body);
        }

    } catch (err) {
        console.error("Local Server Error:", err);
        res.status(500).json({ message: 'Fatal local server error', error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Local Lambda Dev Server running on http://localhost:${PORT}`);
    console.log(`Make sure your frontend uses VITE_ADMIN_API_URL=http://localhost:${PORT}`);
});
