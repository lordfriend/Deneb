export class AuthError extends Error {

  static LOGIN_FAIL = 'invalid name or password';
  static INVALID_REQUEST = 'invalid parameter';

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
