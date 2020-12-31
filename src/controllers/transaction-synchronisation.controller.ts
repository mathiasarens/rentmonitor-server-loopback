import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  getModelSchemaRef,
  post,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {TanRequiredError} from 'node-fints';
import {AccountSynchronisationResult} from '../services/accountsynchronisation/account-synchronisation.service';
import {
  TransactionSynchronisationResult,
  TransactionSynchronisationService,
  TransactionSynchronisationServiceBindings,
} from '../services/accountsynchronisation/transaction-synchronisation.service';
import {TanRequiredResult} from './results/tan-required-result';

export class TransactionSynchronisationController {
  constructor(
    @inject(TransactionSynchronisationServiceBindings.SERVICE)
    public transactionSynchronisationService: TransactionSynchronisationService,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) {}

  @post('/account-synchronization/single', {
    responses: {
      '200': {
        description: 'TransactionSynchronsiationResult',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TransactionSynchronisationResult),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async synchronsiseExistingTransactions(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<AccountSynchronisationResult | TanRequiredResult> {
    try {
      const accountSynchronisationResult = await this.accountSynchronisationService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForASingleAccount(
        new Date(),
        currentUserProfile.clientId,
        accountSynchronisationRequest.accountSettingsId,
        new Date(accountSynchronisationRequest.from!),
        new Date(accountSynchronisationRequest.to!),
        accountSynchronisationRequest.tan,
      );
      return accountSynchronisationResult;
    } catch (error) {
      if (error instanceof TanRequiredError) {
        this.response.status(210);
        return new TanRequiredResult(error);
      } else {
        console.error(error);
        throw error;
      }
    }
  }

  @post('/account-synchronization/all', {
    responses: {
      '200': {
        description: 'AccountSynchronsiationResult',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AccountSynchronisationResult),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async synchronsiseAccounts(
    @requestBody({
      description: 'data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              from: {type: 'string'},
              to: {type: 'string'},
              transactionReference: {type: 'string'},
              tan: {type: 'string'},
            },
          },
        },
      },
    })
    accountSynchronisationRequest: AccountSynchronisationRequestSingleAccount,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<AccountSynchronisationResult[]> {
    try {
      const accountSynchronisationResults = await this.accountSynchronisationService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForAllAccounts(
        new Date(),
        currentUserProfile.clientId,
        new Date(accountSynchronisationRequest.from!),
        new Date(accountSynchronisationRequest.to!),
      );
      return accountSynchronisationResults;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
