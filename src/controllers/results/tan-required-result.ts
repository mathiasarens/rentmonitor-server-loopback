import {TanRequiredError} from 'fints-psd2-lib';

export class TanRequiredResult {
  challengeText: string;
  challengeMediaBase64: string;
  constructor(error: TanRequiredError) {
    this.challengeText = error.challengeText;
    if (error.challengeMedia) {
      this.challengeMediaBase64 = error.challengeMedia.toString('base64');
    }
  }
}
