import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {post} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {
  AccountSynchronisationService,
  AccountSynchronisationServiceBindings,
} from '../services/accountsynchronisation/account-synchronisation.service';

export class AccountSynchronisationController {
  constructor(
    @inject(AccountSynchronisationServiceBindings.SERVICE)
    public accountSynchronisationService: AccountSynchronisationService,
  ) {}

  @post('/account-synchronization', {
    responses: {
      '204': {},
    },
  })
  @authenticate('jwt')
  async synchronsiseAccounts(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    this.accountSynchronisationService
      .retrieveAndSaveNewAccountTransactionsAndCreateNewBookings(
        new Date(),
        currentUserProfile.clientId,
      )
      .catch(error => {
        console.error(error);
      });
    return Promise.resolve();
  }
}
