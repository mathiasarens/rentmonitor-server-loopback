"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
class Crypto {
    constructor(algorithm, password, salt) {
        this.algorithm = algorithm;
        this.password = password;
        this.salt = salt;
        // Key length is dependent on the algorithm. In this case for aes192, it is
        // 24 bytes (192 bits).
        this.key = crypto.scryptSync(password, salt, 24);
        // Use `crypto.randomBytes()` to generate a random iv instead of the static iv
        // shown here.
        this.iv = Buffer.alloc(16, 0); // Initialization vector.
    }
    async encrypt(str) {
        if (str) {
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
            let encrypted = cipher.update(str, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return Promise.resolve(encrypted);
        }
        else {
            return Promise.reject();
        }
    }
    async decrypt(str) {
        if (str) {
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
            let decrypted = decipher.update(str, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return Promise.resolve(decrypted);
        }
        else {
            return Promise.reject();
        }
    }
}
exports.Crypto = Crypto;
//# sourceMappingURL=crypto.service.js.map