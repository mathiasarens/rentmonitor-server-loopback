import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DataObject,
  DefaultCrudRepository,
  Filter,
  Options,
  repository,
} from '@loopback/repository';
import {ClientRepository} from '.';
import {RentmonitorDataSource} from '../datasources';
import {AccountSettings, AccountSettingsRelations, Client} from '../models';
import {Crypto} from '../services/cipher/crypto.service';

export class AccountSettingsRepository extends DefaultCrudRepository<
  AccountSettings,
  typeof AccountSettings.prototype.id,
  AccountSettingsRelations
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof AccountSettings.prototype.id
  >;
  private crypto: Crypto;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
    @inject('datasources.encryption.password')
    password: string,
  ) {
    super(AccountSettings, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );

    this.crypto = new Crypto('aes-192-cbc', password, '!!RentMonitor!!');
  }

  public async create(
    entity: DataObject<AccountSettings>,
    options?: Options,
  ): Promise<AccountSettings> {
    const encryptedEntity = this.encrypt(entity);
    const savedEncryptedEntity = await super.create(encryptedEntity, options);
    return this.decrypt(savedEncryptedEntity);
  }

  public async find(
    filter?: Filter<AccountSettings>,
    options?: Options,
  ): Promise<AccountSettings[]> {
    const results: AccountSettings[] = await super.find(filter, options);
    return Promise.resolve(this.decryptList(results));
  }

  private encrypt(
    entity: DataObject<AccountSettings>,
  ): DataObject<AccountSettings> {
    const encryptedEntity = {...entity};
    if (entity.fintsBlz) {
      encryptedEntity.fintsBlz = this.crypto.encrypt(entity.fintsBlz);
    }
    if (entity.fintsUrl) {
      encryptedEntity.fintsUrl = this.crypto.encrypt(entity.fintsUrl);
    }
    if (entity.fintsUser) {
      encryptedEntity.fintsUser = this.crypto.encrypt(entity.fintsUser);
    }
    if (entity.fintsPassword) {
      encryptedEntity.fintsPassword = this.crypto.encrypt(entity.fintsPassword);
    }
    return encryptedEntity;
  }

  private decrypt(entity: AccountSettings): AccountSettings {
    const encryptedEntity = Object.assign({}, entity);
    if (entity.fintsBlz) {
      encryptedEntity.fintsBlz = this.crypto.decrypt(entity.fintsBlz);
    }
    if (entity.fintsUrl) {
      encryptedEntity.fintsUrl = this.crypto.decrypt(entity.fintsUrl);
    }
    if (entity.fintsUser) {
      encryptedEntity.fintsUser = this.crypto.decrypt(entity.fintsUser);
    }
    if (entity.fintsPassword) {
      encryptedEntity.fintsPassword = this.crypto.decrypt(entity.fintsPassword);
    }
    return encryptedEntity;
  }

  private decryptList(accountSettings: AccountSettings[]): AccountSettings[] {
    return accountSettings.map(a => this.decrypt(a));
  }
}
