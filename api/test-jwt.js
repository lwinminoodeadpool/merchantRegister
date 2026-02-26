const jwt = require('jsonwebtoken');

const SECRET = 'YTxXDEHC8uOi3gclY2M2q1HSJ9Dqv3p9FpyQHrp+K78g=';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci0xMjMiLCJyb2xlIjoibWVyY2hhbnQiLCJpYXQiOjE3NzE1ODA1NDUsImV4cCI6NDkyNTE4MDU0NX0.O5T-xhveLvmU4JFtKekfRC4UXQP32ZDONHON39BGLx8';

try {
    const decoded = jwt.verify(TEST_TOKEN, SECRET);
    console.log("SUCCESS:", decoded);
} catch (e) {
    console.log("FAIL:", e.message);
}
