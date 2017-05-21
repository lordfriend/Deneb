import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../user-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatch } from '../form-utils';
import { register } from 'ts-node/dist/ts-node';
import { AuthError } from '../../helpers/error/AuthError';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ClientError } from '../../helpers/error/ClientError';


/**
 * Register User Component, /register
 * This component is also used for forget password
 */
@Component({
    selector: 'register',
    templateUrl: './register.html',
    styleUrls: ['./register.less']
})
export class Register implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    registerForm: FormGroup;

    urlPath: string;

    errorMessage: string;

    constructor(private userService: UserService,
        private formBuilder: FormBuilder,
        private router: Router,
        titleService: Title) {
        titleService.setTitle(`注册 - ${SITE_TITLE}`);
        // if user already login, redirect to home, user must logout to visit this page.
        userService.getUserInfo()
            .subscribe(() => {
                router.navigateByUrl('/');
            });
    }

    ngOnInit(): void {
        let inviteCode;
        if (location.search) {
            let queryMatch = /invite=([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})/ig.exec(location.search);
            inviteCode = queryMatch && queryMatch.length > 0 ? queryMatch[1] : undefined;
        }

        this.buildForm(inviteCode);
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    onSubmit() {
        this._subscription.add(this.userService.register(this.registerForm.value)
            .subscribe(
                () => {
                    this.router.navigate(['/login']);
                },
                error => {
                    if (error instanceof AuthError) {
                        switch (error.message) {
                            case AuthError.DUPLICATE_NAME:
                                this.errorMessage = '用户名已存在';
                                break;
                            case AuthError.INVALID_INVITE_CODE:
                                this.errorMessage = '邀请码不合法';
                                break;
                            case AuthError.PASSWORD_MISMATCH:
                                this.errorMessage = '密码不匹配';
                                break;
                            case AuthError.INVALID_EMAIL:
                                this.errorMessage = '邮件格式不合法';
                                break;
                            case ClientError.DUPLICATE_EMAIL:
                                this.errorMessage = '邮件地址已经被使用';
                            default:
                                this.errorMessage = error.message;
                        }
                    } else {
                        this.errorMessage = error.message;
                    }
                }
            )
        );
    }

    private buildForm(inviteCode?: string): void {
        this.registerForm = this.formBuilder.group({
            name: ['', Validators.required],
            password: ['', Validators.required],
            password_repeat: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            invite_code: [inviteCode || '', Validators.required]
        }, { validator: passwordMatch('password', 'password_repeat') });
    }
}
