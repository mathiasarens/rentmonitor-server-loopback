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
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {AccountTransaction} from '../models';
import {AccountTransactionRepository} from '../repositories';

export const AccountTransactionUrl = '/account-transactions';

export class AccountTransactionController {
  constructor(
    @repository(AccountTransactionRepository)
    public accountTransactionRepository: AccountTransactionRepository,
  ) {}

  @get(AccountTransactionUrl + '/count', {
    responses: {
      '200': {
        description: 'AccountTransaction model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async count(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('where', getWhereSchemaFor(AccountTransaction))
    where?: Where<AccountTransaction>,
  ): Promise<Count> {
    const whereWithClientId = new WhereBuilder(where)
      .impose({
        clientId: currentUserProfile.clientId,
      })
      .build();
    return this.accountTransactionRepository.count(whereWithClientId);
  }

  @get(AccountTransactionUrl, {
    responses: {
      '200': {
        description: 'Array of AccountTransaction model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(AccountTransaction),
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
    @param.query.object('filter', getFilterSchemaFor(AccountTransaction))
    filter?: Filter<AccountTransaction>,
  ): Promise<AccountTransaction[]> {
    return this.accountTransactionRepository.find(
      new FilterBuilder(filter)
        .where(
          new WhereBuilder(filter?.where)
            .impose({clientId: currentUserProfile.clientId})
            .build(),
        )
        .build(),
    );
  }

  @get(AccountTransactionUrl + '/{id}', {
    responses: {
      '200': {
        description: 'AccountTransaction model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AccountTransaction),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<AccountTransaction> {
    const result = await this.accountTransactionRepository.find({
      where: {clientId: currentUserProfile.clientId, id: id},
    });
    return result[0];
  }

  @del(AccountTransactionUrl + '/{id}', {
    responses: {
      '204': {
        description: 'AccountTransaction DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<void> {
    await this.accountTransactionRepository.deleteAll({
      id: id,
      clientId: currentUserProfile.clientId,
    });
  }
}
