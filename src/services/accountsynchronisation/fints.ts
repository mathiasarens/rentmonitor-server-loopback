import {FinTSClient} from 'openfin-ts';

export class FintsAccountTransactionSynchronization {
  client: FinTSClient;

  constructor() {
    this.client = new FinTSClient(
      <string>process.env.FINTS_BLZ,
      <string>process.env.FINTS_URL,
      <string>process.env.FINTS_USER,
      <string>process.env.FINTS_PASSWORD,
    );
  }

  async load() {
    try {
      await this.client.connect();
      const transactions = await this.client.getTransactions(
        this.client.konten[0].sepaData,
        null,
        null,
      );
      transactions.forEach(transaction => {
        //console.log(transaction);
      });
      await this.client.close();
    } catch (err) {
      console.log(err);
    }
  }
}
