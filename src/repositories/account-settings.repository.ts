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

  public async findOne(
    filter?: Filter<AccountSettings>,
    options?: Options,
  ): Promise<AccountSettings | null> {
    const result = await super.findOne(filter, options);
    if (result) {
      return Promise.resolve(this.decrypt(result));
    } else {
      return Promise.resolve(null);
    }
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

  public async update(data: AccountSettings, options?: Options): Promise<void> {
    await super.update(data, options);
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
    if (entity.iban) {
      encryptedEntity.iban = this.crypto.encrypt(entity.iban);
    }
    if (entity.bic) {
      encryptedEntity.bic = this.crypto.encrypt(entity.bic);
    }
    if (entity.fintsTanRequiredError) {
      encryptedEntity.fintsTanRequiredError = this.crypto.encrypt(
        entity.fintsTanRequiredError,
      );
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
    if (entity.iban) {
      encryptedEntity.iban = this.crypto.decrypt(entity.iban);
    }
    if (entity.bic) {
      encryptedEntity.bic = this.crypto.decrypt(entity.bic);
    }
    if (entity.fintsTanRequiredError) {
      encryptedEntity.fintsTanRequiredError = this.crypto.decrypt(
        entity.fintsTanRequiredError,
      );
    }
    return encryptedEntity;
  }

  private decryptList(accountSettings: AccountSettings[]): AccountSettings[] {
    return accountSettings.map(a => this.decrypt(a));
  }
}
