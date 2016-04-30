import {Component, OnInit} from 'angular2/core';
import {User} from "../entity";
import {UserService} from "../user-service";
import {FormBuilder, ControlGroup, Validators} from "angular2/common";
import {passwordMatch} from "../form-utils";

@Component({
  selector: 'register',
  template: require('./register.html'),
  providers: [UserService]
})
export class Register implements OnInit {

  public user: User;

  public registerForm: ControlGroup;

  constructor(
    private _userService: UserService,
    private _formBuilder:FormBuilder
  ){
    this.user = new User();
  }

  ngOnInit():any {
    this.registerForm = this._formBuilder.group({
      name: ['', Validators.required],
      password: ['', Validators.required],
      password_repeat: ['', Validators.required],
      invite_code: ['', Validators.required]
    }, {validator: passwordMatch('password', 'password_repeat')});
    return undefined;
  }

  registerUser() {
    this._userService.register(this.user)
      .subscribe(
        result => console.log(result),
        error => console.log(error)
      );
  }
}
