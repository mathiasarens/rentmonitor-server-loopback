export declare class Crypto {
    private algorithm;
    private password;
    private salt;
    private key;
    private iv;
    constructor(algorithm: string, password: string, salt: string);
    encrypt(str?: string): Promise<string>;
    decrypt(str?: string): Promise<string>;
}
