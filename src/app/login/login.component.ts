import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../entity';
import { AuthError } from '../../helpers/error/AuthError';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
    selector: 'login',
    templateUrl: './login.html',
    styleUrls: ['./login.less']
})
export class Login implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    loginForm: FormGroup;

    user: User;

    inProgress: boolean = false;

    errorMessage: string;

    siteTitle: string = SITE_TITLE;

    sourceUrl: string;

    constructor(private userService: UserService,
                private route: ActivatedRoute,
                private router: Router,
                private title: Title,
                private formBuilder: FormBuilder) {
        this.user = new User();
    }

    private buildForm(): void {
        this.loginForm = this.formBuilder.group({
            name: ['', Validators.required],
            password: ['', Validators.required],
            remember: [false]
        });
    };

    ngOnInit(): void {
        this.title.setTitle(`登录 - ${this.siteTitle}`);
        this.buildForm();
        this._subscription.add(
            this.route.params
                .subscribe((params) => {
                    this.sourceUrl = params['sourceUrl'];
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    login(): void {
        this.inProgress = true;
        this._subscription.add(
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
        );
    }
}
