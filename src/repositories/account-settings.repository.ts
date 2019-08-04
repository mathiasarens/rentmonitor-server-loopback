import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  Count,
  DataObject,
  DefaultCrudRepository,
  Filter,
  Options,
  repository,
  Where,
} from '@loopback/repository';
import {ClientRepository} from '.';
import {RentmonitorDataSource} from '../datasources';
import {AccountSettings, Client} from '../models';
import {Crypto} from '../services/cipher/crypto.service';

export class AccountSettingsRepository {
  private proxy: AccountSettingsRepositoryInternal;
  private crypto: Crypto;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
    @inject('datasources.encryption.password')
    password: string,
  ) {
    this.proxy = new AccountSettingsRepositoryInternal(
      dataSource,
      clientRepositoryGetter,
    );
    this.crypto = new Crypto('aes-192-cbc', password, '!!RentMonitor!!');
  }

  public async create(
    entity: DataObject<AccountSettings>,
    options?: Options,
  ): Promise<AccountSettings> {
    const encryptedEntity = {...entity};
    if (entity.fintsBlz) {
      encryptedEntity.fintsBlz = await this.crypto.encrypt(entity.fintsBlz);
    }
    if (entity.fintsUrl) {
      encryptedEntity.fintsUrl = await this.crypto.encrypt(entity.fintsUrl);
    }
    if (entity.fintsUser) {
      encryptedEntity.fintsUser = await this.crypto.encrypt(entity.fintsUser);
    }
    if (entity.fintsPassword) {
      encryptedEntity.fintsPassword = await this.crypto.encrypt(
        entity.fintsPassword,
      );
    }
    return this.proxy.create(encryptedEntity, options);
  }

  public async find(
    filter?: Filter<AccountSettings>,
    options?: Options,
  ): Promise<AccountSettings[]> {
    const results: AccountSettings[] = await this.proxy.find(filter, options);
    for (const result of results) {
      if (result.fintsBlz) {
        result.fintsBlz = await this.crypto.decrypt(result.fintsBlz);
      }
      if (result.fintsUrl) {
        result.fintsUrl = await this.crypto.decrypt(result.fintsUrl);
      }
      if (result.fintsUser) {
        result.fintsUser = await this.crypto.decrypt(result.fintsUser);
      }
      if (result.fintsPassword) {
        result.fintsPassword = await this.crypto.decrypt(result.fintsPassword);
      }
    }
    return Promise.resolve(results);
  }

  public exists(
    id: typeof AccountSettings.prototype.id,
    options?: Options,
  ): Promise<boolean> {
    return this.proxy.exists(id, options);
  }

  public deleteAll(
    where?: Where<AccountSettings>,
    options?: Options,
  ): Promise<Count> {
    return this.proxy.deleteAll(where, options);
  }
}

class AccountSettingsRepositoryInternal extends DefaultCrudRepository<
  AccountSettings,
  typeof AccountSettings.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof AccountSettings.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(AccountSettings, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );
  }
}
