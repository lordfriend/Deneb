import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../entity/user';
import { UserService } from '../../user-service/user.service';
import { Subscription } from 'rxjs/Subscription';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { BaseError } from '../../../helpers/error/BaseError';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatch } from '../../form-utils/validators';

@Component({
    selector: 'user-center',
    templateUrl: './user-center.html',
    styleUrls: ['./user-center.less']
})
export class UserCenter implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

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
        current_pass: {
            'required': '当前密码不能为空'
        },
        new_pass: {
            'required': '新密码不能为空'
        },
        new_pass_repeat: {
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
        current_pass: [],
        new_pass: [],
        new_pass_repeat: []
    };

    constructor(private _userSerivce: UserService,
                private _fb: FormBuilder,
                toastService: UIToast) {
        this._toastRef = toastService.makeText();
    }

    ngOnInit(): void {
        this.buildForm();
        this._subscription.add(
            this._userSerivce.getUserInfo()
                .subscribe(
                    user => {
                        this.user = user;
                        this.emailForm.patchValue(this.user);
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );

    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    updateEmail() {
        let emailModel = this.emailForm.value;
        this._subscription.add(
            this._userSerivce.updateEmail(emailModel.email, emailModel.current_pass)
            .subscribe(
                () => {
                    this._toastRef.show('更新成功, 请到邮箱确认邮件地址');
                    this.user.email = emailModel.email;
                    this.user.email_confirmed = false;
                    this.emailForm.markAsPristine();
                },
                (error: BaseError) => {
                    this._toastRef.show(error.message);
                }
            )
        );
    }

    updatePass() {
        let passModel = this.passwordForm.value;
        this._subscription.add(
            this._userSerivce.updatePass(passModel.current_pass, passModel.new_pass, passModel.new_pass_repeat)
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
            current_pass: ['', Validators.required],
            new_pass: ['', Validators.required],
            new_pass_repeat: ['', Validators.required]
        }, {validator: passwordMatch('new_pass', 'new_pass_repeat')});

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
}
