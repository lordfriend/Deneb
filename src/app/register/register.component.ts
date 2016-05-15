import {Component, OnInit} from '@angular/core';
import {User} from "../entity";
import {UserService} from "../user-service";
import {FormBuilder, ControlGroup, Validators} from "@angular/common";
import {passwordMatch} from "../form-utils";
import {Router, OnActivate, ComponentInstruction} from "@angular/router-deprecated";
import {register} from "ts-node/dist/ts-node";
import {AuthError} from "../error/AuthError";

require('./register.less');

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

  public errorMessage: string;

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
        () => {
          this._router.navigate(['Login']);
        },
        error => {
          if(error instanceof AuthError) {
            switch(error.message) {
              case AuthError.INVALID_INVITE_CODE:
                    this.errorMessage = '邀请码不合法';
                    break;
              default:
                    this.errorMessage = error.message;
            }
          } else {
            this.errorMessage = error.message;
          }
        }
      );
  }

  registerUser() {
    this._userService.register(this.user)
      .subscribe(
        () => {
          this._router.navigate(['Login']);
        },
        error => {
          if(error instanceof AuthError) {
            switch(error.message) {
              case AuthError.DUPLICATE_NAME:
                    this.errorMessage = '用户名已存在';
                    break;
              case AuthError.INVALID_INVITE_CODE:
                    this.errorMessage = '邀请码不合法';
                    break;
              case AuthError.PASSWORD_MISMATCH:
                    this.errorMessage = '密码不匹配';
                    break;
              default:
                    this.errorMessage = error.message;
            }
          } else {
            this.errorMessage = error.message;
          }
        }
      );
  }
}
