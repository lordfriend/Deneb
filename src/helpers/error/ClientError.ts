import {BaseError} from "./BaseError";


export class ClientError extends BaseError {

  // common error
  static INVALID_REQUEST = 'invalid parameter';

  static DUPLICATE_EMAIL = 'duplicate email';

  static MAIL_NOT_EXISTS = 'email not exists';

  constructor(
    public message: string,
    public status: number) {
    super('ClientError', message, status);
  }
}
