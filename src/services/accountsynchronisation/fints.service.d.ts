export declare class FintsAccountTransactionSynchronizationService {
    constructor();
    load(fintsBlz: string, fintsUrl: string, fintsUser: string, fintsPassword: string): Promise<FinTsAccountTransactionDTO[]>;
    private parseFinTsTransactionRecord;
    private parseValueFromFinTsTransactionRecord;
}
export declare class FinTsAccountTransactionDTO {
    rawstring: string;
    date?: Date | undefined;
    name?: string | undefined;
    iban?: string | undefined;
    bic?: string | undefined;
    text?: string | undefined;
    value?: number | undefined;
    constructor(rawstring: string, date?: Date | undefined, name?: string | undefined, iban?: string | undefined, bic?: string | undefined, text?: string | undefined, value?: number | undefined);
}
