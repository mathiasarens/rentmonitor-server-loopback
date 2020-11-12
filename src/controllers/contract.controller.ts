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
import {Contract} from '../models';
import {ContractRepository} from '../repositories';

export const ContractsUrl = '/contracts';

export class ContractController {
  constructor(
    @repository(ContractRepository)
    public contractRepository: ContractRepository,
  ) {}

  @post(`${ContractsUrl}`, {
    responses: {
      '200': {
        description: 'Contract model instance',
        content: {'application/json': {schema: getModelSchemaRef(Contract)}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contract, {
            title: 'NewContract',
            exclude: ['id'],
          }),
        },
      },
    })
    contract: Omit<Contract, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Contract> {
    contract.clientId = currentUserProfile.clientId;
    return this.contractRepository.create(contract);
  }

  @get(`${ContractsUrl}/count`, {
    responses: {
      '200': {
        description: 'Contract model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async count(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('where', getWhereSchemaFor(Contract))
    where?: Where<Contract>,
  ): Promise<Count> {
    const whereWithClientId = new WhereBuilder(where)
      .impose({
        clientId: currentUserProfile.clientId,
      })
      .build();
    return this.contractRepository.count(whereWithClientId);
  }

  @get(`${ContractsUrl}`, {
    responses: {
      '200': {
        description: 'Array of Contract model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Contract, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('filter', getFilterSchemaFor(Contract))
    filter?: Filter<Contract>,
  ): Promise<Contract[]> {
    return this.contractRepository.find(
      new FilterBuilder(filter)
        .where(
          new WhereBuilder(filter?.where)
            .impose({clientId: currentUserProfile.clientId})
            .build(),
        )
        .build(),
    );
  }

  @patch(`${ContractsUrl}`, {
    responses: {
      '200': {
        description: 'Contract PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contract, {partial: true}),
        },
      },
    })
    contract: Contract,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('where', getWhereSchemaFor(Contract))
    where?: Where<Contract>,
  ): Promise<Count> {
    return this.contractRepository.updateAll(
      contract,
      new WhereBuilder(where)
        .impose({
          clientId: currentUserProfile.clientId,
        })
        .build(),
    );
  }

  @get(`${ContractsUrl}/{id}`, {
    responses: {
      '200': {
        description: 'Contract model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Contract, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Contract))
    filter?: Filter<Contract>,
  ): Promise<Contract> {
    return this.contractRepository.findById(id, filter);
  }

  @patch(`${ContractsUrl}/{id}`, {
    responses: {
      '204': {
        description: 'Contract PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contract, {partial: true}),
        },
      },
    })
    contract: Contract,
  ): Promise<void> {
    await this.contractRepository.updateById(id, contract);
  }

  @put(`${ContractsUrl}/{id}`, {
    responses: {
      '204': {
        description: 'Contract PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() contract: Contract,
  ): Promise<void> {
    await this.contractRepository.replaceById(id, contract);
  }

  @del(`${ContractsUrl}/{id}`, {
    responses: {
      '204': {
        description: 'Contract DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.contractRepository.deleteById(id);
  }
}
