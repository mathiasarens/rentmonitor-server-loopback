import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
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
  getModelSchemaRef,
  getWhereSchemaFor,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {AccountSettings} from '../models';
import {AccountSettingsRepository} from '../repositories';

export class AccountSettingsController {
  constructor(
    @repository(AccountSettingsRepository)
    public accountSettingsRepository: AccountSettingsRepository,
  ) {}

  @post('/account-settings', {
    responses: {
      '200': {
        description: 'AccountSettings model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(AccountSettings)},
        },
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountSettings, {
            exclude: ['id', 'clientId'],
          }),
        },
      },
    })
    accountSettings: Omit<AccountSettings, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<AccountSettings> {
    accountSettings.clientId = currentUserProfile.clientId;
    const accountSettingsFromDb = await this.accountSettingsRepository.create(
      accountSettings,
    );
    return Promise.resolve(this.filterPassword(accountSettingsFromDb));
  }

  @get('/account-settings/count', {
    responses: {
      '200': {
        description: 'AccountSettings model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async count(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('where', getWhereSchemaFor(AccountSettings))
    where?: Where<AccountSettings>,
  ): Promise<Count> {
    const whereWithClientId = Object.assign({}, where, {
      clientId: currentUserProfile.clientId,
    });
    return this.accountSettingsRepository.count(whereWithClientId);
  }

  @get('/account-settings', {
    responses: {
      '200': {
        description: 'Array of AccountSettings model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(AccountSettings)},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('filter', getFilterSchemaFor(AccountSettings))
    filter?: Filter<AccountSettings>,
  ): Promise<AccountSettings[]> {
    const filterWithClientId = filter
      ? Object.assign({}, filter, {
          where: {
            and: [{clientId: currentUserProfile.clientId}, filter.where],
          },
        })
      : {where: {clientId: currentUserProfile.clientId}};
    const accountSettingsFromDb: AccountSettings[] = await this.accountSettingsRepository.find(
      filterWithClientId,
    );
    return Promise.resolve(this.filterPasswordList(accountSettingsFromDb));
  }

  @patch('/account-settings', {
    responses: {
      '200': {
        description: 'AccountSettings PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountSettings, {
            partial: true,
            exclude: ['id', 'clientId'],
          }),
        },
      },
    })
    accountSettings: AccountSettings,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.object('where', getWhereSchemaFor(AccountSettings))
    where?: Where<AccountSettings>,
  ): Promise<Count> {
    return this.accountSettingsRepository.updateAll(
      accountSettings,
      Object.assign({}, where, {clientId: currentUserProfile.clientId}),
    );
  }

  @get('/account-settings/{id}', {
    responses: {
      '200': {
        description: 'AccountSettings model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(AccountSettings)},
        },
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<AccountSettings> {
    const result = await this.accountSettingsRepository.find({
      where: {clientId: currentUserProfile.clientId, id: id},
    });
    return this.filterPasswordList(result)[0];
  }

  @patch('/account-settings/{id}', {
    responses: {
      '204': {
        description: 'AccountSettings PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountSettings, {
            partial: true,
            exclude: ['clientId'],
          }),
        },
      },
    })
    accountSettings: AccountSettings,
  ): Promise<void> {
    await this.accountSettingsRepository.updateAll(accountSettings, {
      id: id,
      clientId: currentUserProfile.clientId,
    });
  }

  @put('/account-settings/{id}', {
    responses: {
      '204': {
        description: 'AccountSettings PUT success',
      },
    },
  })
  @authenticate('jwt')
  async replaceById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountSettings, {
            partial: false,
            exclude: ['clientId'],
          }),
        },
      },
    })
    accountSettings: AccountSettings,
  ): Promise<void> {
    const result = await this.accountSettingsRepository.findById(id);
    if (result) {
      if (result.clientId !== currentUserProfile.clientId) {
        throw new HttpErrors.UnprocessableEntity();
      }
      accountSettings.clientId = currentUserProfile.clientId;
      await this.accountSettingsRepository.replaceById(id, accountSettings);
    }
  }

  @del('/account-settings/{id}', {
    responses: {
      '204': {
        description: 'AccountSettings DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<void> {
    await this.accountSettingsRepository.deleteAll({
      id: id,
      clientId: currentUserProfile.clientId,
    });
  }

  private filterPassword(accountSettings: AccountSettings): AccountSettings {
    const accountSettingsWithPassword = Object.assign({}, accountSettings);
    accountSettingsWithPassword.fintsPassword = '';
    return accountSettingsWithPassword;
  }

  private filterPasswordList(
    accountSettings: AccountSettings[],
  ): AccountSettings[] {
    return accountSettings.map(this.filterPassword);
  }
}
