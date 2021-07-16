import * as crypto from 'crypto';

export class Crypto {
  private key: Buffer;
  private iv: Buffer;

  constructor(
    private algorithm: string,
    private password: string,
    private salt: string,
  ) {
    // Key length is dependent on the algorithm. In this case for aes192, it is
    // 24 bytes (192 bits).
    this.key = crypto.scryptSync(password, salt, 24);
    // Use `crypto.randomBytes()` to generate a random iv instead of the static iv
    // shown here.
    this.iv = Buffer.alloc(16, 0); // Initialization vector.
  }

  public encrypt(str?: string): string {
    if (str) {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(str, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } else {
      return '';
    }
  }

  public decrypt(str?: string): string {
    if (str) {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        this.iv,
      );
      let decrypted;
      try {
        decrypted = decipher.update(str, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
      } catch (e) {
        decrypted = 'decrypt error';
        console.log(e);
      }
      return decrypted;
    } else {
      return '';
    }
  }
}
