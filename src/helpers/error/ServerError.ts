import {BaseError} from './BaseError';


export class ServerError extends BaseError {
  constructor(
    public message: string,
    public status: number) {
    super('ServerError', message, status);
  }
}
