import {FinTSClient, TransactionRecord} from 'openfin-ts';
import {FinTsAccountTransaction as FinTsAccountTransactionRecord} from './fints.account.transaction';

export class FintsAccountTransactionSynchronization {
  client: FinTSClient;

  constructor() {
    this.client = new FinTSClient(
      process.env.FINTS_BLZ as string,
      process.env.FINTS_URL as string,
      process.env.FINTS_USER as string,
      process.env.FINTS_PASSWORD as string,
    );
  }

  async load(): Promise<FinTsAccountTransactionRecord[]> {
    let accountTransactions: FinTsAccountTransactionRecord[] = [];
    try {
      await this.client.connect();
      const transactions = await this.client.getTransactions(
        this.client.konten[0].sepaData,
        null,
        null,
      );

      transactions.forEach(transaction => {
        transaction.records.forEach(transactionRecord => {
          accountTransactions.push(
            this.parseFinTsTransactionRecord(transactionRecord),
          );
        });
      });
      await this.client.close();
      return Promise.resolve(accountTransactions);
    } catch (err) {
      console.log(err);
      return Promise.reject();
    }
  }

  private parseFinTsTransactionRecord(
    transactionRecord: TransactionRecord,
  ): FinTsAccountTransactionRecord {
    try {
      return new FinTsAccountTransactionRecord(
        JSON.stringify(transactionRecord),
        transactionRecord.date,
        transactionRecord.description.nameKontrahent,
        transactionRecord.description.ibanKontrahent,
        transactionRecord.description.bicKontrahent,
        transactionRecord.description.text,
        this.parseValueFromFinTsTransactionRecord(transactionRecord),
      );
    } catch (err) {
      console.log(err);
      return new FinTsAccountTransactionRecord(
        JSON.stringify(transactionRecord),
      );
    }
  }

  private parseValueFromFinTsTransactionRecord(
    transactionRecord: TransactionRecord,
  ): number {
    let value: number = parseInt(
      transactionRecord.value
        .toString()
        .split('.')
        .join(''),
    );
    if (transactionRecord.transactionType === 'S') {
      value = value * -1;
    }
    return value;
  }
}
