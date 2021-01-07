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
  ContractToBookingResult,
  ContractToBookingService,
  ContractToBookingServiceBindings,
} from '../services/accountsynchronisation/contract-to-booking.service';
import {TransactionToBookingResult} from '../services/accountsynchronisation/transaction-to-booking.service';
export const ContractToBookingUrl = '/contract-to-booking';
class ContractToBookingRequest {
  tenantIds?: number[];
  from?: string;
  to?: string;
  constructor() {}
}
export class ContractToBookingController {
  constructor(
    @inject(ContractToBookingServiceBindings.SERVICE)
    public contractToBookingService: ContractToBookingService,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) {}

  @post(ContractToBookingUrl, {
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
  async synchronsiseContracts(
    @requestBody({
      description: 'data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              tenantIds: {type: 'array'},
              from: {type: 'string'},
              to: {type: 'string'},
            },
            required: [],
          },
        },
      },
    })
    contractToBookingRequest: ContractToBookingRequest,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<ContractToBookingResult> {
    try {
      const contractToBookingResult = await this.contractToBookingService.createAndSaveBookingsForContracts(
        new Date(),
        currentUserProfile.clientId,
        contractToBookingRequest.tenantIds,
        contractToBookingRequest.from
          ? new Date(contractToBookingRequest.from!)
          : undefined,
        contractToBookingRequest.to
          ? new Date(contractToBookingRequest.to!)
          : undefined,
      );
      return contractToBookingResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
