const crypto = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) {
        return false;
    }

    const derivedKey = await scryptAsync(password, salt, 64);
    const storedKey = Buffer.from(keyHex, 'hex');

    if (storedKey.length !== derivedKey.length) {
        return false;
    }

    return crypto.timingSafeEqual(storedKey, derivedKey);
}

module.exports = {
    hashPassword,
    verifyPassword,
};