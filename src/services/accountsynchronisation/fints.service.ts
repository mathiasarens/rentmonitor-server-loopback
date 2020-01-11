import {bind, BindingKey, BindingScope} from '@loopback/core';
import {PinTanClient, SEPAAccount, Transaction} from 'fints-psd2-lib';

@bind({
  scope: BindingScope.SINGLETON,
  tags: ['service'],
})
export class FintsService {
  constructor() {}

  public async fetchStatements(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
    selectedAccount: string,
  ): Promise<FinTsAccountTransactionDTO[]> {
    const accountTransactions: FinTsAccountTransactionDTO[] = [];
    const fintsClient: PinTanClient = new PinTanClient({
      blz: fintsBlz,
      url: fintsUrl,
      name: fintsUser!,
      pin: fintsPassword!,
      productId: '9FA6681DEC0CF3046BFC2F8A6',
    });
    const account: SEPAAccount = JSON.parse(selectedAccount);

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 3);

    const statements = await fintsClient.statements(
      account,
      startDate,
      endDate,
    );
    statements.forEach(statement => {
      statement.transactions.forEach(transactionRecord => {
        accountTransactions.push(
          this.parseFinTsTransactionRecord(transactionRecord),
        );
      });
    });

    return Promise.resolve(accountTransactions);
  }

  public async fetchAccounts(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): Promise<FinTsAccountDTO[]> {
    const fintsClient: PinTanClient = new PinTanClient({
      blz: fintsBlz,
      url: fintsUrl,
      name: fintsUser!,
      pin: fintsPassword!,
      productId: '9FA6681DEC0CF3046BFC2F8A6',
    });

    const accounts = await fintsClient.accounts();

    return accounts.map(
      account =>
        new FinTsAccountDTO(
          JSON.stringify(account),
          account.accountName,
          account.iban,
          account.bic,
        ),
    );
  }

  private parseFinTsTransactionRecord(
    transaction: Transaction,
  ): FinTsAccountTransactionDTO {
    try {
      return new FinTsAccountTransactionDTO(
        JSON.stringify(transaction),
        new Date(transaction.valueDate),
        transaction.descriptionStructured!.name,
        transaction.descriptionStructured!.iban,
        transaction.descriptionStructured!.bic,
        transaction.descriptionStructured!.reference.text,
        this.parseValueFromFinTsTransactionRecord(transaction),
      );
    } catch (err) {
      console.log(err);
      return new FinTsAccountTransactionDTO(JSON.stringify(transaction));
    }
  }

  private parseValueFromFinTsTransactionRecord(
    transactionRecord: Transaction,
  ): number {
    let value: number = parseInt(
      transactionRecord.amount
        .toString()
        .split('.')
        .join(''),
    );
    if (!transactionRecord.isCredit) {
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

export class FinTsAccountDTO {
  constructor(
    public rawstring: string,
    public name?: string,
    public iban?: string,
    public bic?: string,
  ) {}
}

export namespace FintsServiceBindings {
  export const SERVICE = BindingKey.create<FintsService>(
    'services.fints.service',
  );
}
