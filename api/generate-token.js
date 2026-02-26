const jwt = require('jsonwebtoken');

// Change this to match the EXACT secret you put into your AWS Lambda Environment Variables!
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY_HERE';

// Generate a token that expires in 100 years for testing purposes
const token = jwt.sign(
    {
        id: 'test-user-123',
        role: 'merchant'
    },
    JWT_SECRET,
    { expiresIn: '36500d' } // 100 years
);

console.log("\n========================================================");
console.log("Here is your new testing JWT Token (Valid for 100 years):");
console.log("========================================================\n");
console.log(token);
console.log("\n========================================================");
console.log("1. Copy the token above.");
console.log("2. Open frontend/src/App.jsx");
console.log("3. Replace the JWT_TOKEN variable with this new token.");
console.log("========================================================\n");
