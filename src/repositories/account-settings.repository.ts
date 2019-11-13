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
    @inject('datasources.encryption.salt')
    salt: string,
  ) {
    super(AccountSettings, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );

    this.crypto = new Crypto('aes-192-cbc', password, salt);
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

  public async updateAll(
    data: DataObject<AccountSettings>,
    where?: Where<AccountSettings>,
    options?: Options,
  ): Promise<Count> {
    const encryptedEntity = this.encrypt(data);
    const count = await super.updateAll(encryptedEntity, where, options);
    return count;
  }

  public async replaceById(
    id: number,
    data: DataObject<AccountSettings>,
    options?: Options,
  ): Promise<void> {
    const encryptedEntity = this.encrypt(data);
    await super.replaceById(id, encryptedEntity, options);
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
