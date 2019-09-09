import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { Count, CountSchema, Filter, repository, Where } from '@loopback/repository';
import { del, get, getFilterSchemaFor, getModelSchemaRef, getWhereSchemaFor, param, patch, post, put, requestBody } from '@loopback/rest';
import { AccountSettings } from '../models';
import { AccountSettingsRepository } from '../repositories';
import { UserClientProfile } from '../services/authentication/user-client-profile.vo';

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
          schema: getModelSchemaRef(AccountSettings, {exclude: ['id']}),
        },
      },
    })
    accountSettings: Omit<AccountSettings, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserClientProfile,
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
    currentUserProfile: UserClientProfile,
    @param.query.object('where', getWhereSchemaFor(AccountSettings))
    where?: Where<AccountSettings>,
  ): Promise<Count> {
    return this.accountSettingsRepository.count({
      and: [{clientId: currentUserProfile.clientId}, {...where}],
    });
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
  async find(
    @param.query.object('filter', getFilterSchemaFor(AccountSettings))
    filter?: Filter<AccountSettings>,
  ): Promise<AccountSettings[]> {
    const accountSettingsFromDb: AccountSettings[] = await this.accountSettingsRepository.find(
      filter,
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
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountSettings, {partial: true}),
        },
      },
    })
    accountSettings: AccountSettings,
    @param.query.object('where', getWhereSchemaFor(AccountSettings))
    where?: Where<AccountSettings>,
  ): Promise<Count> {
    return this.accountSettingsRepository.updateAll(accountSettings, where);
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
  async findById(
    @param.path.number('id') id: number,
  ): Promise<AccountSettings> {
    return this.accountSettingsRepository.findById(id);
  }

  @patch('/account-settings/{id}', {
    responses: {
      '204': {
        description: 'AccountSettings PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountSettings, {partial: true}),
        },
      },
    })
    accountSettings: AccountSettings,
  ): Promise<void> {
    await this.accountSettingsRepository.updateById(id, accountSettings);
  }

  @put('/account-settings/{id}', {
    responses: {
      '204': {
        description: 'AccountSettings PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() accountSettings: AccountSettings,
  ): Promise<void> {
    await this.accountSettingsRepository.replaceById(id, accountSettings);
  }

  @del('/account-settings/{id}', {
    responses: {
      '204': {
        description: 'AccountSettings DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.accountSettingsRepository.deleteById(id);
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
