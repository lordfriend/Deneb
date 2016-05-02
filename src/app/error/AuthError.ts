export class AuthError extends Error {

  // login error
  static LOGIN_FAIL = 'invalid name or password';

  // common error
  static INVALID_REQUEST = 'invalid parameter';

  // register error
  static INVALID_INVITE_CODE = 'invalid invite code';
  static DUPLICATE_NAME = 'duplicate name';
  static PASSWORD_MISMATCH = 'password not match';

  // update pass error
  static PASSWORD_INCORRECT = 'password incorrect';

  constructor(
    public message: string,
    public status: number) {
    super(message);
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
