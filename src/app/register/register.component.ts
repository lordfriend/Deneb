import {Component, OnInit} from '@angular/core';
import {UserService} from "../user-service";
import {FormBuilder, Control, ControlGroup, Validators} from "@angular/common";
import {passwordMatch} from "../form-utils";
import {register} from "ts-node/dist/ts-node";
import {AuthError} from "../error/AuthError";
import {Title} from '@angular/platform-browser';
import {Router, NavigationEnd} from '@angular/router';


require('./register.less');

/**
 * Register User Component, /register
 * This component is also used for forget password
 */
@Component({
  selector: 'register',
  template: require('./register.html'),
  providers: [UserService, Title]
})
export class Register implements OnInit {

  registerForm: ControlGroup;
  name: Control;
  password: Control;
  password_repeat: Control;
  invite_code: Control;

  public urlPath: string;

  public title: string;

  public errorMessage: string;

  constructor(
    private userService: UserService,
    private formBuilder:FormBuilder,
    private router: Router,
    titleService: Title
  ){
    titleService.setTitle('注册 - ' + SITE_TITLE);
    router.events.subscribe(
      (event) => {
        if(event instanceof NavigationEnd) {
          this.urlPath = event.url;
          console.log(this.urlPath);
          this.title = {'/register': '注册', '/forget': '找回密码'}[this.urlPath];
        }
      }
    );
  }

  private buildForm(): void {
    this.name = new Control('', Validators.required);
    this.password = new Control('', Validators.required);
    this.password_repeat = new Control('', Validators.required);
    this.invite_code = new Control('', Validators.required);
    this.registerForm = this.formBuilder.group({
      name: this.name,
      password: this.password,
      password_repeat: this.password_repeat,
      invite_code: this.invite_code
    }, {validator: passwordMatch('password', 'password_repeat')});
  }

  ngOnInit():any {
    this.buildForm();
    return undefined;
  }

  onSubmit() {
    if(this.urlPath === '/register') {
      this.registerUser();
    } else {
      this.resetPassword();
    }
  }

  resetPassword() {
    this.userService.resetPassword(this.registerForm.value)
      .subscribe(
        () => {
          this.router.navigate(['/login']);
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
    this.userService.register(this.registerForm.value)
      .subscribe(
        () => {
          this.router.navigate(['/login']);
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
