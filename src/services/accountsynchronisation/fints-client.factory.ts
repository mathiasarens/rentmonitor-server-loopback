import {PinTanClient} from 'node-fints';

export interface FintsClientFactory {
  create(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): PinTanClient;
}
