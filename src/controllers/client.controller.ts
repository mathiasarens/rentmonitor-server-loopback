import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/context';
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
  getWhereSchemaFor,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Client} from '../models';
import {ClientRepository} from '../repositories';

export class ClientController {
  constructor(
    @repository(ClientRepository)
    public clientRepository: ClientRepository,
  ) {}

  @post('/clients', {
    responses: {
      '200': {
        description: 'Client model instance',
        content: {'application/json': {schema: {'x-ts-type': Client}}},
      },
    },
  })
  async create(@requestBody() client: Client): Promise<Client> {
    try {
      return await this.clientRepository.create(client);
    } catch (error) {
      if (error.constraint && error.constraint === 'client_name_idx') {
        throw new HttpErrors.BadRequest(
          `Client name: '${client.name}' already exists`,
        );
      } else {
        throw error;
      }
    }
  }

  @get('/clients/count', {
    responses: {
      '200': {
        description: 'Client model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Client))
    where?: Where<Client>,
  ): Promise<Count> {
    return this.clientRepository.count(where).catch(error => {
      console.error(
        `Could not connect to datadase - host: ${this.clientRepository.dataSource.settings.host} database: ${this.clientRepository.dataSource.settings.database} port: ${this.clientRepository.dataSource.settings.port} user: ${this.clientRepository.dataSource.settings.user} password: ${this.clientRepository.dataSource.settings.password}`,
      );
      console.error(error);
      return Promise.reject(error);
    });
  }

  @get('/clients', {
    responses: {
      '200': {
        description: 'Array of Client model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Client}},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('filter', getFilterSchemaFor(Client))
    filter?: Filter<Client>,
  ): Promise<Client[]> {
    return this.clientRepository.find(
      new FilterBuilder(filter)
        .where(
          new WhereBuilder(filter?.where)
            .impose({id: currentUserProfile.clientId})
            .build(),
        )
        .build(),
    );
  }

  // @patch('/clients', {
  //   responses: {
  //     '200': {
  //       description: 'Client PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async updateAll(
  //   @requestBody() client: Client,
  //   @param.query.object('where', getWhereSchemaFor(Client))
  //   where?: Where<Client>,
  // ): Promise<Count> {
  //   return this.clientRepository.updateAll(client, where);
  // }

  @get('/clients/{id}', {
    responses: {
      '200': {
        description: 'Client model instance',
        content: {'application/json': {schema: {'x-ts-type': Client}}},
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<Client> {
    if (id === currentUserProfile.clientId) {
      return this.clientRepository.findById(id);
    } else {
      return Promise.reject(`incorrect client id: ${id}`);
    }
  }

  @patch('/clients/{id}', {
    responses: {
      '204': {
        description: 'Client PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    @requestBody() client: Client,
  ): Promise<void> {
    if (id === currentUserProfile.clientId) {
      await this.clientRepository.updateById(id, client);
    } else {
      return Promise.reject(`incorrect client id: ${id}`);
    }
  }

  @put('/clients/{id}', {
    responses: {
      '204': {
        description: 'Client PUT success',
      },
    },
  })
  @authenticate('jwt')
  async replaceById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    @requestBody() client: Client,
  ): Promise<void> {
    if (id === currentUserProfile.clientId) {
      await this.clientRepository.replaceById(id, client);
    } else {
      return Promise.reject(`incorrect client id: ${id}`);
    }
  }

  @del('/clients/{id}', {
    responses: {
      '204': {
        description: 'Client DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<void> {
    if (id === currentUserProfile.clientId) {
      await this.clientRepository.deleteById(id);
    } else {
      return Promise.reject(`incorrect client id: ${id}`);
    }
  }
}
