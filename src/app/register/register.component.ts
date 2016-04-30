import {Component, OnInit} from 'angular2/core';
import {User} from "../entity";
import {UserService} from "../user-service";
import {FormBuilder, ControlGroup, Validators} from "angular2/common";
import {passwordMatch} from "../form-utils";
import {Router, OnActivate, ComponentInstruction} from "angular2/router";
import {register} from "ts-node/dist/ts-node";

/**
 * Register User Component, /register
 * This component is also used for forget password
 */
@Component({
  selector: 'register',
  template: require('./register.html'),
  providers: [UserService]
})
export class Register implements OnInit, OnActivate {

  public user: User;

  public registerForm: ControlGroup;

  public urlPath: string;

  public title: string;

  constructor(
    private _userService: UserService,
    private _formBuilder:FormBuilder,
    private _router: Router
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

  routerOnActivate(nextInstruction:ComponentInstruction, prevInstruction:ComponentInstruction):any|Promise<any> {
    this.urlPath = nextInstruction.urlPath;
    this.title = {'register': '注册', 'forget': '找回密码'}[this.urlPath];
    return true;
  }

  onSubmit() {
    if(this.urlPath === 'register') {
      this.registerUser();
    } else {
      this.resetPassword();
    }
  }

  resetPassword() {
    this._userService.resetPassword(this.user)
      .subscribe(
        result => console.log(result),
        error => console.log(error)
      );
  }

  registerUser() {
    this._userService.register(this.user)
      .subscribe(
        result => console.log(result),
        error => console.log(error)
      );
  }
}
