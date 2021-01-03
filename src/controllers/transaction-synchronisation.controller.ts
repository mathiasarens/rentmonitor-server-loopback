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
import {
  TransactionSynchronisationResult,
  TransactionSynchronisationService,
  TransactionSynchronisationServiceBindings,
} from '../services/accountsynchronisation/transaction-synchronisation.service';
export const TransactionSynchronisationUrl = '/transaction-synchronisation';
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

  @post(TransactionSynchronisationUrl, {
    responses: {
      '200': {
        description: 'AccountSynchronsiationResult',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TransactionSynchronisationResult),
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
            required: [],
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
        transactionSynchronisationRequest.from
          ? new Date(transactionSynchronisationRequest.from!)
          : undefined,
        transactionSynchronisationRequest.to
          ? new Date(transactionSynchronisationRequest.to!)
          : undefined,
      );
      return transactionSynchronisationResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
