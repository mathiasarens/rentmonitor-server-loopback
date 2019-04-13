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
import {Debitor} from '../models';
import {DebitorRepository} from '../repositories';

export class DebitorControllerController {
  constructor(
    @repository(DebitorRepository)
    public debitorRepository: DebitorRepository,
  ) {}

  @post('/debitors', {
    responses: {
      '200': {
        description: 'Debitor model instance',
        content: {'application/json': {schema: {'x-ts-type': Debitor}}},
      },
    },
  })
  async create(@requestBody() debitor: Debitor): Promise<Debitor> {
    return await this.debitorRepository.create(debitor);
  }

  @get('/debitors/count', {
    responses: {
      '200': {
        description: 'Debitor model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Debitor)) where?: Where,
  ): Promise<Count> {
    return await this.debitorRepository.count(where);
  }

  @get('/debitors', {
    responses: {
      '200': {
        description: 'Array of Debitor model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Debitor}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Debitor)) filter?: Filter,
  ): Promise<Debitor[]> {
    return await this.debitorRepository.find(filter);
  }

  @patch('/debitors', {
    responses: {
      '200': {
        description: 'Debitor PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() debitor: Debitor,
    @param.query.object('where', getWhereSchemaFor(Debitor)) where?: Where,
  ): Promise<Count> {
    return await this.debitorRepository.updateAll(debitor, where);
  }

  @get('/debitors/{id}', {
    responses: {
      '200': {
        description: 'Debitor model instance',
        content: {'application/json': {schema: {'x-ts-type': Debitor}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Debitor> {
    return await this.debitorRepository.findById(id);
  }

  @patch('/debitors/{id}', {
    responses: {
      '204': {
        description: 'Debitor PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() debitor: Debitor,
  ): Promise<void> {
    await this.debitorRepository.updateById(id, debitor);
  }

  @put('/debitors/{id}', {
    responses: {
      '204': {
        description: 'Debitor PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() debitor: Debitor,
  ): Promise<void> {
    await this.debitorRepository.replaceById(id, debitor);
  }

  @del('/debitors/{id}', {
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
