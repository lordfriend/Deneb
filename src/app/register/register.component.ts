import {Component} from 'angular2/core';
import {User} from "../entity";
import {UserService} from "../user-service";

@Component({
  selector: 'register',
  template: require('./register.html'),
  providers: [UserService]
})
export class Register {

  public user: User;

  constructor(
    private _userService: UserService
  ){
    this.user = new User();
  }

  registerUser() {
    this._userService.register(this.user)
      .subscribe(
        result => console.log(result),
        error => console.log(error)
      );
  }
}
