import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'restds',
  connector: 'rest',
  baseURL: 'http://localhost:3000',
  crud: false,
  "options": {
    "headers": {
      "accept": "application/octet-stream",
      "content-type": "application/octet-stream"
    }
  },
  "operations": [
    {
      "template": {
        "method": "GET",
        "url": "http://localhost:3000/files/{filename}"
      },
      "functions": {
        "getFile": ["filename"]
      }
    }
  ]
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class RestdsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'restds';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.restds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
