import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, getModelSchemaRef, Response, RestBindings} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {
  BookingSumPerTenant,
  TenantBookingOverviewService,
  TenantBookingOverviewServiceBindings,
} from '../services/overview/tenant-booking-overview.service';
export const TenantBookingOverviewUrl = '/tenant-booking-overview';

export class TenantBookingOverviewController {
  constructor(
    @inject(TenantBookingOverviewServiceBindings.SERVICE)
    public tenantBookingOverviewService: TenantBookingOverviewService,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) {}

  @get(TenantBookingOverviewUrl, {
    responses: {
      '200': {
        description: 'TenantBookingOverviewResult',
        content: {
          'application/json': {
            schema: getModelSchemaRef(BookingSumPerTenant),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async loadTenantBookingOverview(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<BookingSumPerTenant[]> {
    try {
      const bookingSumPerTenantList =
        await this.tenantBookingOverviewService.loadBookingSumPerTenant(
          currentUserProfile.clientId,
        );
      return bookingSumPerTenantList;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
