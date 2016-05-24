import {Component, OnInit} from '@angular/core';
import {UserService} from '../user-service';
import {FormBuilder, ControlGroup, Validators, Control} from '@angular/common';
import {User} from '../entity';
import {AuthError} from '../error/AuthError';
import {Router, OnActivate, ComponentInstruction} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';

require('./login.less');

@Component({
  selector: 'login',
  template: require('./login.html'),
  providers: [UserService, Title]
})
export class Login implements OnInit, OnActivate {

  loginForm: ControlGroup;
  name: Control;
  password: Control;

  user: User;

  inProgress: boolean = false;

  errorMessage: string;

  siteTitle: string = SITE_TITLE;

  sourceUrl: string;

  constructor(private _userService:UserService,
              private _titleService: Title,
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
  };

  ngOnInit() {
    this._titleService.setTitle(`登录 - ${this.siteTitle}`);
    this._buildForm();
  }


  routerOnActivate(nextInstruction:ComponentInstruction, prevInstruction:ComponentInstruction):any|Promise<any> {
    console.log(nextInstruction);
    if(nextInstruction.params['url']) {
      this.sourceUrl = nextInstruction.params['url'];
    }
    return true;
  }

  login():void {
    this.inProgress = true;
    this._userService.login(this.loginForm.value)
      .subscribe(
        () => {
          this.inProgress = false;
          if(this.sourceUrl) {
            this._router.navigateByUrl(this.sourceUrl);
          } else {
            this._router.navigate(['Index']);
          }

        },
        error => {
          this.inProgress = false;
          if (error instanceof AuthError) {
            if (error.isLoginFailed()) {
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
