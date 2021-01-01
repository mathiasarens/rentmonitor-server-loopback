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
import {AccountSynchronisationResult} from '../services/accountsynchronisation/account-synchronisation.service';
import {
  TransactionSynchronisationResult,
  TransactionSynchronisationService,
  TransactionSynchronisationServiceBindings,
} from '../services/accountsynchronisation/transaction-synchronisation.service';

class TransactionSynchronisationRequest {
  from?: Date;
  to?: Date;
  constructor() {}
}
export class TransactionSynchronisationController {
  constructor(
    @inject(TransactionSynchronisationServiceBindings.SERVICE)
    public transactionSynchronisationService: TransactionSynchronisationService,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) {}

  @post('/transaction-synchronisation', {
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
  async synchronsiseTransactions(
    @requestBody({
      description: 'data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              from: {type: 'string'},
              to: {type: 'string'},
            },
          },
        },
      },
    })
    transactionSynchronisationRequest: TransactionSynchronisationRequest,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<TransactionSynchronisationResult> {
    try {
      const transactionSynchronisationResult = await this.transactionSynchronisationService.createAndSaveBookingsForUnmatchedAccountTransactions(
        new Date(),
        currentUserProfile.clientId,
        new Date(transactionSynchronisationRequest.from!),
        new Date(transactionSynchronisationRequest.to!),
      );
      return transactionSynchronisationResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
