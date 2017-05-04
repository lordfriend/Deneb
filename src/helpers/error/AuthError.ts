import {BaseError} from './BaseError';

export class AuthError extends BaseError {

  // login error
  static LOGIN_FAIL = 'invalid name or password';


  // register error
  static INVALID_INVITE_CODE = 'invalid invite code';
  static DUPLICATE_NAME = 'duplicate name';
  static PASSWORD_MISMATCH = 'password not match';
  static INVALID_EMAIL = 'invalid email';

  // update pass error
  static PASSWORD_INCORRECT = 'password incorrect';

  static PERMISSION_DENIED = 'permission denied';

  constructor(
    public message: string,
    public status: number) {
    super('AuthError', message, status);
  }

  public isPermission(): boolean {
    return this.status === 403;
  }

  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  public isLoginFailed(): boolean {
    return this.status === 400 && this.message === AuthError.LOGIN_FAIL;
  }
}
