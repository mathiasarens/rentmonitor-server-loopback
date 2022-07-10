// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/context';
import {get} from '@loopback/rest';
import fetch from 'node-fetch';
import {TokenServiceBindings} from '../keys';

export class CognitoJwksController {
  constructor(
    @inject(TokenServiceBindings.AWS_COGNITO_JWK_URL)
    private jwkUrl: string,
  ) {}

  @get('/cognito-jwks', {
    responses: {
      '200': {
        description: 'application version',
        content: {},
      },
    },
  })
  async cognitoJwks(): Promise<string | undefined> {
    return this.load(this.jwkUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async load(url: string): Promise<any> {
    console.log(`Loading ${url}`);
    const jwkResponse = await fetch(url);
    if (jwkResponse.ok) {
      const jwks = await jwkResponse.json();
      console.log(`JWKS: ${JSON.stringify(jwks)}`);
      return jwks;
    } else {
      console.error(
        `Failed to load jwk from ${url} response code: ${jwkResponse.status}`,
      );
      throw new Error(
        'Failed to load jwk from ' +
          url +
          ' response code ' +
          jwkResponse.status,
      );
    }
  }
}
