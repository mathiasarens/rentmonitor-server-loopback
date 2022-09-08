import {bind, BindingKey, BindingScope, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  PinTanClient,
  SEPAAccount,
  TanRequiredError,
  Transaction,
} from '@mathiasarens/fints';
import {AccountSettings} from '../../models';
import {AccountSettingsRepository} from '../../repositories';
import {FintsClientFactory} from './fints-client.factory';
import {FintsClientBindings} from './fints-client.factory.impl';
import {
  FinTsAccountDTO,
  FinTsAccountTransactionDTO,
  FintsService,
} from './fints.service';

@bind({
  scope: BindingScope.SINGLETON,
  tags: ['service'],
})
export class FintsServiceImpl implements FintsService {
  constructor(
    @inject(FintsClientBindings.FACTORY)
    private fintsClientFactory: FintsClientFactory,
    @repository(AccountSettingsRepository)
    private accountSettingsRepository: AccountSettingsRepository,
  ) {}

  public async fetchStatements(
    accountSettings: AccountSettings,
    from?: Date,
    to?: Date,
    tan?: string,
  ): Promise<FinTsAccountTransactionDTO[]> {
    const accountTransactions: FinTsAccountTransactionDTO[] = [];
    const fintsClient: PinTanClient = this.fintsClientFactory.create(
      accountSettings.fintsBlz,
      accountSettings.fintsUrl,
      accountSettings.fintsUser,
      accountSettings.fintsPassword,
    );
    const account: SEPAAccount = JSON.parse(accountSettings.rawAccount);
    const endDate = to ?? new Date();
    let startDate: Date;
    if (from === undefined) {
      startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 2);
    } else {
      startDate = from;
    }
    let statements;
    try {
      if (tan) {
        const tanRequiredError: TanRequiredError = JSON.parse(
          accountSettings.fintsTanRequiredError!,
        );
        statements = await fintsClient.completeStatements(
          tanRequiredError.dialog,
          tanRequiredError.transactionReference,
          tan,
        );
      } else {
        statements = await fintsClient.statements(account, from, endDate);
      }
      statements.forEach(statement => {
        statement.transactions.forEach(transactionRecord => {
          accountTransactions.push(
            this.parseFinTsTransactionRecord(transactionRecord),
          );
        });
      });

      return await Promise.resolve(accountTransactions);
    } catch (error) {
      if (error instanceof TanRequiredError) {
        accountSettings.fintsTanRequiredError = JSON.stringify(error);
        await this.accountSettingsRepository.update(
          new AccountSettings(accountSettings),
        );
      }
      throw error;
    }
  }

  public async fetchAccounts(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): Promise<FinTsAccountDTO[]> {
    const fintsClient: PinTanClient = this.fintsClientFactory.create(
      fintsBlz,
      fintsUrl,
      fintsUser,
      fintsPassword,
    );

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
      console.error(err);
      return new FinTsAccountTransactionDTO(JSON.stringify(transaction));
    }
  }

  private parseValueFromFinTsTransactionRecord(
    transactionRecord: Transaction,
  ): number {
    let value: number = parseInt((transactionRecord.amount * 100).toFixed(0));
    if (!transactionRecord.isCredit) {
      value = value * -1;
    }
    return value;
  }
}

export namespace FintsServiceBindings {
  export const SERVICE = BindingKey.create<FintsService>(
    'services.fints.service',
  );
}
