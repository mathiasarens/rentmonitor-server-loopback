import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {Tenant} from '../models';
import {TenantRepository} from '../repositories';

export class TenantControllerController {
  constructor(
    @repository(TenantRepository)
    public debitorRepository: TenantRepository,
  ) {}

  @post('/tenants', {
    responses: {
      '200': {
        description: 'Debitor model instance',
        content: {'application/json': {schema: {'x-ts-type': Tenant}}},
      },
    },
  })
  async create(@requestBody() debitor: Tenant): Promise<Tenant> {
    return await this.debitorRepository.create(debitor);
  }

  @get('/tenants/count', {
    responses: {
      '200': {
        description: 'Debitor model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Tenant)) where?: Where,
  ): Promise<Count> {
    return await this.debitorRepository.count(where);
  }

  @get('/tenants', {
    responses: {
      '200': {
        description: 'Array of Debitor model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Tenant}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Tenant)) filter?: Filter,
  ): Promise<Tenant[]> {
    return await this.debitorRepository.find(filter);
  }

  @patch('/tenants', {
    responses: {
      '200': {
        description: 'Debitor PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() debitor: Tenant,
    @param.query.object('where', getWhereSchemaFor(Tenant)) where?: Where,
  ): Promise<Count> {
    return await this.debitorRepository.updateAll(debitor, where);
  }

  @get('/tenants/{id}', {
    responses: {
      '200': {
        description: 'Debitor model instance',
        content: {'application/json': {schema: {'x-ts-type': Tenant}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Tenant> {
    return await this.debitorRepository.findById(id);
  }

  @patch('/tenants/{id}', {
    responses: {
      '204': {
        description: 'Debitor PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() debitor: Tenant,
  ): Promise<void> {
    await this.debitorRepository.updateById(id, debitor);
  }

  @put('/tenants/{id}', {
    responses: {
      '204': {
        description: 'Debitor PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() debitor: Tenant,
  ): Promise<void> {
    await this.debitorRepository.replaceById(id, debitor);
  }

  @del('/tenants/{id}', {
    responses: {
      '204': {
        description: 'Debitor DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.debitorRepository.deleteById(id);
  }
}
