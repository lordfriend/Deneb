import { Component, OnInit } from '@angular/core';
import { UserService } from '../user-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatch } from '../form-utils';
import { register } from 'ts-node/dist/ts-node';
import { AuthError } from '../../helpers/error/AuthError';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';


/**
 * Register User Component, /register
 * This component is also used for forget password
 */
@Component({
    selector: 'register',
    templateUrl: './register.html',
    styleUrls: ['./register.less']
})
export class Register implements OnInit {

    registerForm: FormGroup;

    urlPath: string;

    title: string;

    errorMessage: string;

    mode: string;

    constructor(private userService: UserService,
        private formBuilder: FormBuilder,
        private router: Router,
        titleService: Title) {
        router.events.subscribe(
            (event) => {
                if (event instanceof NavigationEnd) {
                    this.urlPath = event.url;
                    if (/^\/register/ig.test(this.urlPath)) {
                        this.mode = 'register';
                        this.title = '注册';
                    } else if (/^\/forget/ig.test(this.urlPath)) {
                        this.mode = 'forget';
                        this.title = '找回密码';
                    }

                    titleService.setTitle(`${this.title} - ${SITE_TITLE}`);
                }
            }
        );
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

    onSubmit() {
        if (this.mode === 'register') {
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
                if (error instanceof AuthError) {
                    switch (error.message) {
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
                        default:
                            this.errorMessage = error.message;
                    }
                } else {
                    this.errorMessage = error.message;
                }
            }
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
