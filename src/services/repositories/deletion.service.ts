import {repository} from '@loopback/repository';
import {
  AccountSettingsRepository,
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../repositories';

export class DeletionService {
  constructor(
    @repository(ClientRepository) private clientRepository: ClientRepository,
    @repository(TenantRepository) private tenantRepository: TenantRepository,
    @repository(ContractRepository)
    private contractRepository: ContractRepository,
    @repository(BookingRepository) private bookingRepository: BookingRepository,
    @repository(AccountSettingsRepository)
    private accountSettingsRepository: AccountSettingsRepository,
    @repository(AccountTransactionRepository)
    private accountTransactionRepository: AccountTransactionRepository,
  ) {}

  async deleteAll() {
    await this.bookingRepository.deleteAll();
    await this.contractRepository.deleteAll();
    await this.tenantRepository.deleteAll();

    await this.accountTransactionRepository.deleteAll();
    await this.accountSettingsRepository.deleteAll();
    await this.clientRepository.deleteAll();
  }

  async deleteClient(clientId: number) {
    const where = {clientId: clientId};
    await this.bookingRepository.deleteAll(where);
    await this.contractRepository.deleteAll(where);
    await this.tenantRepository.deleteAll(where);

    await this.accountTransactionRepository.deleteAll(where);
    await this.accountSettingsRepository.deleteAll(where);
    await this.clientRepository.deleteById(clientId);
  }
}
