// Uncomment these imports to begin using these cool features!

import {get} from '@loopback/rest';

export class VersionController {
  constructor() {}

  @get('/version', {
    responses: {
      '200': {
        description: 'application version',
        content: {},
      },
    },
  })
  async version(): Promise<string | undefined> {
    return `${process.env.npm_package_version}`;
  }
}
