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
import {TanRequiredError} from '@philippdormann/fints';
import sub from 'date-fns/sub';
import {AccountTransaction, Booking} from '../models';
import {
  AccountSynchronisationResult,
  AccountSynchronisationService,
  AccountSynchronisationServiceBindings,
} from '../services/accountsynchronisation/account-synchronisation.service';
import {TanRequiredResult} from './results/tan-required-result';

class AccountSynchronisationRequestSingleAccount {
  accountSettingsId: number;
  from?: string;
  to?: string;
  tan?: string;
  constructor() {}
}

export class AccountSynchronisationController {
  constructor(
    @inject(AccountSynchronisationServiceBindings.SERVICE)
    public accountSynchronisationService: AccountSynchronisationService,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) {}

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
  async synchroniseAccount(
    @requestBody({
      description: 'data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              from: {type: 'string'},
              to: {type: 'string'},
              accountSettingsId: {type: 'number'},
              tan: {type: 'string'},
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
      const accountSynchronisationResult =
        await this.accountSynchronisationService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookingsForASingleAccount(
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

  @post('/account-synchronization/test', {
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
  async synchroniseTest(
    @requestBody({
      description: 'data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              from: {type: 'string'},
              to: {type: 'string'},
              accountSettingsId: {type: 'number'},
              tan: {type: 'string'},
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
      const accountSynchronisationResult = new AccountSynchronisationResult(
        accountSynchronisationRequest.accountSettingsId,
        `TestAccount ${accountSynchronisationRequest.accountSettingsId}`,
        [
          new Booking({
            id: 1,
            clientId: currentUserProfile.clientdId,
            tenantId: 1,
            date: sub(new Date(), {months: 1}),
            amount: 7000,
            comment: 'Test Buchung 1',
          }),
          new Booking({
            id: 2,
            clientId: currentUserProfile.clientdId,
            tenantId: 2,
            date: sub(new Date(), {months: 2}),
          }),
        ],
        [
          new AccountTransaction({
            id: 1,
            clientId: currentUserProfile.clientdId,
            accountSettingsId: accountSynchronisationRequest.accountSettingsId,
            date: sub(new Date(), {days: 2}),
            name: 'Test Name 1',
            text: 'Miete April 2020',
            iban: 'DE02200411330178722500',
            bic: 'COBADEHD001',
            amount: 10000,
          }),
        ],
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
}
