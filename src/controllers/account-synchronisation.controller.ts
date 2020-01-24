import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { getModelSchemaRef, post, requestBody, Response, RestBindings } from '@loopback/rest';
import { UserProfile } from '@loopback/security';
import { TanRequiredError } from 'fints-psd2-lib';
import { AccountSynchronisationResult, AccountSynchronisationService, AccountSynchronisationServiceBindings } from '../services/accountsynchronisation/account-synchronisation.service';
import { TanRequiredResult } from './results/TanRequiredResult';

class AccountSynchronisationRequestSingleAccount {
  accountId: number;
  from?: string;
  to?: string;
  transactionReference?: string;
  tan?: string;
  constructor() { }
}

export class AccountSynchronisationController {
  constructor(
    @inject(AccountSynchronisationServiceBindings.SERVICE)
    public accountSynchronisationService: AccountSynchronisationService,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) { }

  @post('/account-synchronization/single', {
    responses: {
      '200': {
        description: 'AccountSynchronsiationResult',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AccountSynchronisationResult),
          },
        },
      },
      '210': {
        description: 'TanRequiredResult model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TanRequiredResult),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async synchronsiseAccount(
    @requestBody({
      description: 'data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              from: { type: 'string' },
              to: { type: 'string' },
              accountId: { type: 'number' },
              transactionReference: { type: 'string' },
              tan: { type: 'string' },
            },
          },
        },
      },
    })
    accountSynchronisationRequest: AccountSynchronisationRequestSingleAccount,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<AccountSynchronisationResult | TanRequiredResult> {
    try {
      const accountSynchronisationResult = await this.accountSynchronisationService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForASingleAccount(
        new Date(),
        currentUserProfile.clientId,
        accountSynchronisationRequest.accountId,
        new Date(accountSynchronisationRequest.from!),
        new Date(accountSynchronisationRequest.to!),
        accountSynchronisationRequest.transactionReference,
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
              from: { type: 'string' },
              to: { type: 'string' },
              accountId: { type: 'number' },
              transactionReference: { type: 'string' },
              tan: { type: 'string' },
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
