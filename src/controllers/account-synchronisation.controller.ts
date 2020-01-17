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
import {TanRequiredError} from 'fints-psd2-lib';
import {
  AccountSynchronisationService,
  AccountSynchronisationServiceBindings,
} from '../services/accountsynchronisation/account-synchronisation.service';
import {TanRequiredResult} from './results/TanRequiredResult';

class AccountSynchronisationRequest {
  from?: Date;
  to?: Date;
  transactionReference?: string;
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

  @post('/account-synchronization', {
    responses: {
      '204': {},
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
  async synchronsiseAccounts(
    @requestBody()
    accountSynchronisationRequest: AccountSynchronisationRequest,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void | TanRequiredResult> {
    try {
      await this.accountSynchronisationService.retrieveAndSaveNewAccountTransactionsAndCreateNewBookings(
        new Date(),
        currentUserProfile.clientId,
        accountSynchronisationRequest.from,
        accountSynchronisationRequest.to,
        accountSynchronisationRequest.transactionReference,
        accountSynchronisationRequest.tan,
      );
      return await Promise.resolve();
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
