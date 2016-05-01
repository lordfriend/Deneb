import {Injectable} from "angular2/core";
import {UserService} from "./user.service";
import {User} from "../entity";
import {AuthError} from "../error";
import {ServerError} from "../error/ServerError";
import {Router} from "angular2/router";


@Injectable()
export class Authentication {

  user: User;

  constructor(
    private _userService: UserService,
    private _router: Router
  ) {}

  private _redirectToLogin(): void {
    this._router.navigate(['Login']);
  }

  public invalidateUser(): void {
    this.user = null;
    this._redirectToLogin();
  }

  public checkUserCredential(miniLevel:number = 0): Promise<User | Error> {
    return new Promise((resolve, reject) => {
      if(this.user) {
        if(this.user.level >= miniLevel) {
          resolve(this.user);
        } else {
          reject(new AuthError('permission denied', 403));
        }
      } else {
        this._userService.getUserInfo()
          .subscribe(
            (user: User) => {
              this.user = user;
              if(this.user.level >= miniLevel) {
                resolve(this.user);
              } else {
                reject(new AuthError('permission denied', 403));
              }

            },
            (error: any) => {
              if(error.status === 401) {
                reject(new AuthError(error.json().message, error.status));
              } else if(error.status === 500) {
                reject(new ServerError(error.json().message, error.status));
              } else {
                reject(error);
              }
            }
          )
      }
    })
      .then(
        user => user,
        error => {
          if(error instanceof AuthError && !error.isPermission()) {
            this._redirectToLogin();
          }
          throw error;
        }
      );
  }

}
