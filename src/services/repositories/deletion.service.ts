import {repository} from '@loopback/repository';
import {
  BookingRepository,
  ClientRepository,
  DebitorRepository,
} from '../../repositories';

export class DeletionService {
  constructor(
    @repository(ClientRepository) private clientRepository: ClientRepository,
    @repository(DebitorRepository) private debitorRepository: DebitorRepository,
    @repository(BookingRepository) private bookingRepository: BookingRepository,
  ) {}

  async deleteAll() {
    await this.bookingRepository.deleteAll();
    await this.debitorRepository.deleteAll();
    await this.clientRepository.deleteAll();
  }

  async deleteClient(clientId: number) {
    const where = {clientId: clientId};
    await this.bookingRepository.deleteAll(where);
    await this.debitorRepository.deleteAll(where);
    await this.clientRepository.deleteById(clientId);
  }
}
