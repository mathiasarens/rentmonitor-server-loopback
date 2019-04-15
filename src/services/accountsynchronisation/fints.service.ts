import {bind, BindingScope} from '@loopback/core';
import {FinTSClient, TransactionRecord} from 'openfin-ts';

@bind({
  scope: BindingScope.SINGLETON,
  tags: ['service'],
})
export class FintsAccountTransactionSynchronization {
  constructor() {}

  public async load(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): Promise<FinTsAccountTransactionDTO[]> {
    let accountTransactions: FinTsAccountTransactionDTO[] = [];
    try {
      const fintsClient: FinTSClient = new FinTSClient(
        fintsBlz,
        fintsUrl,
        fintsUser!,
        fintsPassword!,
      );
      await fintsClient.connect();
      const transactions = await fintsClient.getTransactions(
        fintsClient.konten[0].sepaData,
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
      await fintsClient.close();
      return Promise.resolve(accountTransactions);
    } catch (err) {
      console.log(err);
      return Promise.reject();
    }
  }

  private parseFinTsTransactionRecord(
    transactionRecord: TransactionRecord,
  ): FinTsAccountTransactionDTO {
    try {
      return new FinTsAccountTransactionDTO(
        JSON.stringify(transactionRecord),
        transactionRecord.date,
        transactionRecord.description.nameKontrahent.replace('undefined', ''),
        transactionRecord.description.ibanKontrahent,
        transactionRecord.description.bicKontrahent,
        transactionRecord.description.text,
        this.parseValueFromFinTsTransactionRecord(transactionRecord),
      );
    } catch (err) {
      console.log(err);
      return new FinTsAccountTransactionDTO(JSON.stringify(transactionRecord));
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

export class FinTsAccountTransactionDTO {
  constructor(
    public rawstring: string,
    public date?: Date,
    public name?: string,
    public iban?: string,
    public bic?: string,
    public text?: string,
    public value?: number,
  ) {}
}
