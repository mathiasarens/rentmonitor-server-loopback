import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterBuilder,
  repository,
  Where,
  WhereBuilder,
} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Tenant} from '../models';
import {TenantRepository} from '../repositories';
import {filterWhere} from './helper/filter-helper';

export const TenantsUrl = '/tenants';

export class TenantController {
  constructor(
    @repository(TenantRepository)
    public tenantRepository: TenantRepository,
  ) {}

  @post(TenantsUrl, {
    responses: {
      '200': {
        description: 'Tenant model instance',
        content: {'application/json': {schema: {'x-ts-type': Tenant}}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tenant, {
            exclude: ['id', 'clientId'],
          }),
        },
      },
    })
    tenant: Omit<Tenant, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Tenant> {
    tenant.clientId = currentUserProfile.clientId;
    return this.tenantRepository.create(tenant);
  }

  @get(TenantsUrl + '/count', {
    responses: {
      '200': {
        description: 'Tenant model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async count(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('where', getWhereSchemaFor(Tenant))
    where?: Where<Tenant>,
  ): Promise<Count> {
    const whereWithClientId = new WhereBuilder(where)
      .impose({
        clientId: currentUserProfile.clientId,
      })
      .build();
    return this.tenantRepository.count(whereWithClientId);
  }

  @get(TenantsUrl, {
    responses: {
      '200': {
        description: 'Array of Tenant model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Tenant}},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('filter', getFilterSchemaFor(Tenant))
    filter?: Filter<Tenant>,
  ): Promise<Tenant[]> {
    return this.tenantRepository.find(
      new FilterBuilder(filter)
        .where({clientId: currentUserProfile.clientId})
        .build(),
    );
  }

  @patch(TenantsUrl, {
    responses: {
      '200': {
        description: 'Tenant PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tenant, {
            partial: true,
            exclude: ['clientId'],
          }),
        },
      },
    })
    tenant: Tenant,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('where', getWhereSchemaFor(Tenant))
    where?: Where<Tenant>,
  ): Promise<Count> {
    return this.tenantRepository.updateAll(
      tenant,
      filterWhere(currentUserProfile.clientId, where),
    );
  }

  @get(TenantsUrl + '/{id}', {
    responses: {
      '200': {
        description: 'Tenant model instance',
        content: {'application/json': {schema: {'x-ts-type': Tenant}}},
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.number('id') id: number,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Tenant> {
    const result = await this.tenantRepository.find({
      where: {id: id, clientId: currentUserProfile.clientId},
    });
    return result[0];
  }

  @patch(TenantsUrl + '/{id}', {
    responses: {
      '204': {
        description: 'Tenenat PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tenant, {
            partial: true,
            exclude: ['clientId'],
          }),
        },
      },
    })
    tenant: Tenant,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    await this.tenantRepository.updateAll(tenant, {
      id: id,
      clientId: currentUserProfile.clientId,
    });
  }

  @put(TenantsUrl + '/{id}', {
    responses: {
      '204': {
        description: 'Tenant PUT success',
      },
    },
  })
  @authenticate('jwt')
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tenant),
        },
      },
    })
    tenant: Tenant,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    if (currentUserProfile.clientId === tenant.clientId) {
      await this.tenantRepository.replaceById(id, tenant);
    }
  }

  @del(TenantsUrl + '/{id}', {
    responses: {
      '204': {
        description: 'Tenant DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(
    @param.path.number('id') id: number,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    await this.tenantRepository.deleteAll({
      id: id,
      clientId: currentUserProfile.clientId,
    });
  }
}
