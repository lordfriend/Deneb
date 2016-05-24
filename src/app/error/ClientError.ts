import {BaseError} from "./BaseError";


export class ClientError extends BaseError {

  // common error
  static INVALID_REQUEST = 'invalid parameter';
  
  constructor(
    public message: string,
    public status: number) {
    super(message, status);
  }
}
