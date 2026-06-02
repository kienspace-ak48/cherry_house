const CNAME ="generateJWT.util.js ";
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

async function generateJWT(payload){
    const expiresIn = process.env.JWT_EXPIRES_IN;
    const token =await jwt.sign(
        payload,
        secret,
        {
            expiresIn: expiresIn,
        }
    );
    return token;
}
async function verifyJWT(token){
    const decoded = await jwt.verify(token, secret);
    return decoded;
}
module.exports = {
    generateJWT,
    verifyJWT,
}