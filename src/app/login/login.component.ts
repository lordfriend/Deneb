import {Component, OnInit} from '@angular/core';
import {UserService} from "../user-service";
import {FormBuilder, ControlGroup, Validators, Control} from "@angular/common";
import {User} from "../entity";
import {AuthError} from "../error/AuthError";
import {Router} from "@angular/router-deprecated";

require('./login.less');

@Component({
  selector: 'login',
  template: require('./login.html'),
  providers: [UserService]
})
export class Login implements OnInit {

  loginForm: ControlGroup;
  name: Control;
  password: Control;

  user: User;

  errorMessage: string;

  siteTitle: string = SITE_TITLE;

  constructor(private _userService:UserService,
              private _router: Router,
              private _formBuilder: FormBuilder) {
    this.user = new User();
  }

  private _buildForm(): void {
    this.name = new Control('', Validators.required);
    this.password = new Control('', Validators.required);
    this.loginForm = this._formBuilder.group({
      name: this.name,
      password: this.password,
      remember: [false]
    });

    // if we already have user object, refill the form

    // (<Control> this.loginForm.controls['name']).updateValue(this.user.name);
    // (<Control> this.loginForm.controls['password']).updateValue(this.user.password);
    // (<Control> this.loginForm.controls['remember']).updateValue(this.user.remember);
  };

  ngOnInit():any {
    this._buildForm();
    return null;
  }

  toggleRemember() {
    (<Control> this.loginForm.controls['remember']).updateValue(!this.loginForm.controls['remember'].value);
  }

  login(): void {
    this._userService.login(this.loginForm.value)
      .subscribe(
        () => {
          this._router.navigate(['Index']);
        },
        error => {
          if(error instanceof AuthError) {
            if(error.isLoginFailed()) {
              this.errorMessage = '用户名或密码错误';
            } else {
              this.errorMessage = 'Something Happened';
            }
          } else {
            this.errorMessage = '未知错误';
          }
        }
      )
  }
}
