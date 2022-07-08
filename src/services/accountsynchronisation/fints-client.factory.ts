import {PinTanClient} from '@philippdormann/fints';

export interface FintsClientFactory {
  create(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): PinTanClient;
}
