// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  param,
  response,
  ResponseObject,
} from '@loopback/rest';
import {Image} from '../services';

/**
 * OpenAPI response for video()
 */
const VIDEO_RESPONSE: ResponseObject = {
  description: 'Video Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'VideoResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class VideoController {
  //constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  constructor(
    @inject('services.Image')
    protected imageService: Image,
  ) {}

  // Map to `GET /video`
  //@get('/video')
  //@response(200, VIDEO_RESPONSE)
  //video(): object {
    // Reply with a greeting, the current time, the url, and request headers
  //  return {
  //    greeting: 'Hello from LoopBack',
  //    date: new Date(),
  //    url: this.req.url,
  //    headers: Object.assign({}, this.req.headers),
  //  };
  //}

  @get('/video/{filename}')
  async getVideoFile(
    @param.path.string('filename') filename: string,
  ): Promise<Image> {
    return await this.imageService.getFile(filename);
  }
}
