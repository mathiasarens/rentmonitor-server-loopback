import {TanRequiredError} from 'fints-psd2-lib';

export class TanRequiredResult {
  transactionReference: string;
  challengeText: string;
  challengeMediaBase64: string;
  constructor(error: TanRequiredError) {
    this.transactionReference = error.transactionReference;
    this.challengeText = error.challengeText;
    this.challengeMediaBase64 = error.challengeMedia.toString('base64');
  }
}
