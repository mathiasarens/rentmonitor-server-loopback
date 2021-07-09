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
  TransactionToBookingResult,
  TransactionToBookingService,
  TransactionToBookingServiceBindings,
} from '../services/accountsynchronisation/transaction-to-booking.service';
export const TransactionToBookingUrl = '/transaction-to-booking';
class TransactionToBookingRequest {
  from?: Date;
  to?: Date;
  constructor() {}
}
export class TransactionToBookingController {
  constructor(
    @inject(TransactionToBookingServiceBindings.SERVICE)
    public transactionToBookingService: TransactionToBookingService,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) {}

  @post(TransactionToBookingUrl, {
    responses: {
      '200': {
        description: 'TransactionToBookingResult',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TransactionToBookingResult),
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
    transactionToBookingRequest: TransactionToBookingRequest,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<TransactionToBookingResult> {
    try {
      const transactionToBookingResult =
        await this.transactionToBookingService.createAndSaveBookingsForUnmatchedAccountTransactions(
          new Date(),
          currentUserProfile.clientId,
          transactionToBookingRequest.from
            ? new Date(transactionToBookingRequest.from!)
            : undefined,
          transactionToBookingRequest.to
            ? new Date(transactionToBookingRequest.to!)
            : undefined,
        );
      return transactionToBookingResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
