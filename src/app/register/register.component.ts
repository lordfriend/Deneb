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

  }
}
