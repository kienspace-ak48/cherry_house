const CNAME ="hashPassword.util.js ";
const bcrypt = require('bcrypt');

async function hashPassword(password, salt =10){
    return await bcrypt.hash(password, salt);
}
async function comparePassword(password, hashedPassword){
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
}

module.exports = {
    hashPassword,
    comparePassword,
}