import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {RestdsDataSource} from '../datasources';

export interface Image {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getFile(filename: string): Promise<Image>;
}

export class ImageProvider implements Provider<Image> {
  constructor(
    // restds must match the name property in the datasource json file
    @inject('datasources.restds')
    protected dataSource: RestdsDataSource = new RestdsDataSource(),
  ) {}

  value(): Promise<Image> {
    return getService(this.dataSource);
  }
}
