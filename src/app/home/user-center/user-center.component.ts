import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../entity/user';
import { UserService } from '../../user-service/user.service';
import { Subscription } from 'rxjs/Subscription';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { BaseError } from '../../../helpers/error/BaseError';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatch } from '../../form-utils/validators';
import { ClientError } from '../../../helpers/error/ClientError';
import { UserCenterService } from './user-center.service';
import { WebHook } from '../../entity/web-hook';

export const MAIL_SEND_INTERVAL = 60;

@Component({
    selector: 'user-center',
    templateUrl: './user-center.html',
    styleUrls: ['./user-center.less']
})
export class UserCenter implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    resendMailTimeLeft: number;
    timerId: number;

    emailValidationMessages = {
        current_pass: {
            'required': '密码不能为空'
        },
        email: {
            'required': '邮件地址不能为空',
            'email': '邮件地址格式错误'
        }
    };

    passwordValidationMessages = {
        password: {
            'required': '当前密码不能为空'
        },
        new_password: {
            'required': '新密码不能为空'
        },
        new_password_repeat: {
            'required': '重复密码不能为空'
        }
    };

    user: User;

    emailForm: FormGroup;
    passwordForm: FormGroup;

    emailFormErrors = {
        current_pass: [],
        email: []
    };

    passwordFormErrors = {
        password: [],
        new_password: [],
        new_password_repeat: []
    };

    isAddingWebHook = false;
    isLoading = false;

    webHookList: WebHook[];

    constructor(private _userSerivce: UserService,
                private _userCenterService: UserCenterService,
                private _fb: FormBuilder,
                toastService: UIToast) {
        this._toastRef = toastService.makeText();
        let searchString = window.location.search;
        if (searchString) {
            this.isAddingWebHook = true;
            this._subscription.add(
                this._userCenterService.addWebHookToken(searchString.substring(1, searchString.length))
                    .flatMap(() => {
                        this.isAddingWebHook = false;
                        this.isLoading = true;
                        return this._userCenterService.listWebHookToken();
                    })
                    .subscribe((list) => {
                        this.isLoading = false;
                        this.webHookList = list;
                    }, (error: BaseError) => {
                        this.isLoading = false;
                        this.isAddingWebHook = false;
                        this._toastRef.show(error.message);
                    }, () => {
                        this.isAddingWebHook = false;
                    })
            );

        }
    }

    deleteWebHook(webHook: WebHook) {
        this._subscription.add(
            this._userCenterService.deleteWebHookToken(webHook.id)
                .flatMap(() => {
                    this.isLoading = true;
                    return this._userCenterService.listWebHookToken();
                })
                .subscribe((list) => {
                    this.isLoading = false;
                    this.webHookList = list;
                }, (error: BaseError) => {
                    this.isLoading = false;
                    this._toastRef.show(error.message);
                })
        );
    }

    ngOnInit(): void {
        this.buildForm();
        this._subscription.add(
            this._userSerivce.userInfo
                .filter(user => !!user)
                .subscribe(
                    user => {
                        this.user = user;
                        this.emailForm.patchValue(this.user);
                        this.resendMailTimeLeft = MAIL_SEND_INTERVAL - Math.floor((Date.now() - this.getLastMailSendTime()) / 1000);
                        if (this.resendMailTimeLeft > 0) {
                            this.startCountdown();
                        }
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
        if (!this.isLoading && !this.webHookList) {
            this.isLoading = true;
            this._subscription.add(
                this._userCenterService.listWebHookToken()
                    .subscribe((list) => {
                        this.isLoading = false;
                        this.webHookList = list;
                    }, (error: BaseError) => {
                        this.isLoading = false;
                        this._toastRef.show(error.message);
                    })
            );
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    updateEmail() {
        let emailModel = this.emailForm.value;
        this.setLastMailSendTime();
        this._subscription.add(
            this._userSerivce.updateEmail(emailModel.email, emailModel.current_pass)
                .subscribe(
                    () => {
                        this._toastRef.show('更新成功, 请到邮箱确认邮件地址');
                        // this.user.email = emailModel.email;
                        // this.user.email_confirmed = false;
                        this.emailForm.markAsPristine();
                    },
                    (error: BaseError) => {
                        if (error.message === ClientError.DUPLICATE_EMAIL) {
                            this._toastRef.show('邮件地址已被使用');
                        } else {
                            this._toastRef.show(error.message);
                        }
                    }
                )
        );
    }

    updatePass() {
        let passModel = this.passwordForm.value;
        this._subscription.add(
            this._userSerivce.updatePass(passModel.password, passModel.new_password, passModel.new_password_repeat)
                .subscribe(
                    () => {
                        this._toastRef.show('密码修改成功');
                        this.passwordForm.markAsPristine();
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    resendMail() {

        this._subscription.add(
            this._userSerivce.resendMail()
                .subscribe(
                    () => {
                        this._toastRef.show('验证邮件发送成功');
                        this.resendMailTimeLeft = MAIL_SEND_INTERVAL;
                        this.startCountdown();
                        this.setLastMailSendTime();
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    onFormChanged(errors: any, errorMessages, form: FormGroup) {
        for (const field in errors) {
            // clear previous error message array
            errors[field] = [];
            const control = form.get(field);
            if (control && control.dirty && control.invalid) {
                for (const key in control.errors) {
                    let messages = errorMessages[field];
                    errors[field].push(messages[key]);
                }
            }
        }
    }

    private buildForm() {
        this.emailForm = this._fb.group({
            // current_pass: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });
        this.passwordForm = this._fb.group({
            password: ['', Validators.required],
            new_password: ['', Validators.required],
            new_password_repeat: ['', Validators.required]
        }, {validator: passwordMatch('new_password', 'new_password_repeat')});

        // this._subscription.add(
        //     this.emailForm.valueChanges.subscribe(
        //         () => {
        //             this.onFormChanged(this.emailFormErrors, this._emailValidationMessages, this.emailForm);
        //         }
        //     )
        // );
        //
        // this._subscription.add(
        //     this.passwordForm.valueChanges.subscribe(
        //         () => {
        //             this.onFormChanged(this.passwordFormErrors, this._passwordValidationMessages, this.passwordForm);
        //         }
        //     )
        // );

        this.onFormChanged(this.emailFormErrors, this.emailValidationMessages, this.emailForm);
        this.onFormChanged(this.passwordFormErrors, this.passwordValidationMessages, this.passwordForm);
    }

    private startCountdown() {

        if (this.resendMailTimeLeft <= 0) {
            clearInterval(this.timerId);
            return;
        }
        this.timerId = window.setInterval(() => {
            this.resendMailTimeLeft -= 1;
        }, 1000);
    }

    private getLastMailSendTime(): number {
        let last_mail_send_time = parseInt(localStorage.getItem('last_mail_send_time'));
        if (!last_mail_send_time) {
            last_mail_send_time = 0;
        }
        return last_mail_send_time;
    }

    private setLastMailSendTime(): void {
        localStorage.setItem('last_mail_send_time', Date.now() + '');
    }
}
