import {Injectable} from "@angular/core";
import {UserService} from "./user.service";
import {User} from "../entity";


@Injectable()
export class Authentication {

  user: User;

  constructor(
    private _userService: UserService
  ) {}

  public invalidateUser(): void {
    this.user = null;
  }

  public isAuthenticated(): Promise<User | Error> {
    return new Promise((resolve, reject) => {
      if(this.user) {
        resolve(this.user);
      } else {
        this._userService.getUserInfo()
          .subscribe(
            (user: User) => {
              this.user = user;
              resolve(user);
            },
            (error: any) => {
              reject(error);
            }
          )
      }
    });
  }

}
