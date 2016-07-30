import {Component, OnInit, OnDestroy} from '@angular/core';
import {UserService} from '../user-service';
import {FormBuilder, ControlGroup, Validators, Control} from '@angular/common';
import {User} from '../entity';
import {AuthError} from '../error/AuthError';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Rx';

require('./login.less');

@Component({
  selector: 'login',
  template: require('./login.html'),
  providers: [UserService, Title]
})
export class Login implements OnInit, OnDestroy {

  loginForm: ControlGroup;
  name: Control;
  password: Control;

  user: User;

  inProgress: boolean = false;

  errorMessage: string;

  siteTitle: string = SITE_TITLE;

  sourceUrl: string;

  private routeParamsSubscription: Subscription;

  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private title: Title,
              private formBuilder: FormBuilder) {
    this.user = new User();
  }

  private buildForm(): void {
    this.name = new Control('', Validators.required);
    this.password = new Control('', Validators.required);
    this.loginForm = this.formBuilder.group({
      name: this.name,
      password: this.password,
      remember: [false]
    });
  };

  ngOnInit() {
    this.title.setTitle(`登录 - ${this.siteTitle}`);
    this.buildForm();
    this.routeParamsSubscription = this.route.params
      .subscribe((params) => {
        console.log(params);
        this.sourceUrl = params['source'];
      });
  }

  ngOnDestroy(): any {
    this.routeParamsSubscription.unsubscribe();
    return null;
  }

  login(): void {
    this.inProgress = true;
    this.userService.login(this.loginForm.value)
      .subscribe(
        () => {
          if (this.sourceUrl) {
            this.router.navigateByUrl(this.sourceUrl);
          } else {
            this.router.navigateByUrl('/');
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
