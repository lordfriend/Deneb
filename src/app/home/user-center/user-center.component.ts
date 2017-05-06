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

    private _basicInfoValidationMessages = {
        email: {
            'required': '邮件地址不能为空',
            'email': '邮件地址格式错误'
        }
    };

    private _passwordValidationMessages = {
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

    basicInfoForm: FormGroup;
    passwordForm: FormGroup;

    basicInfoFormErrors = {
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
                        this.basicInfoForm.patchValue({email: 'a@b.com'});
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

    private buildForm() {
        this.basicInfoForm = this._fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
        this.passwordForm = this._fb.group({
            current_pass: ['', Validators.required],
            new_pass: ['', Validators.required],
            new_pass_repeat: ['', Validators.required]
        }, {validator: passwordMatch('new_pass', 'new_pass_repeat')});

        this._subscription.add(
            this.basicInfoForm.valueChanges.subscribe(
                data => this.onBasicFormChanged({data})
            )
        );

        this._subscription.add(
            this.passwordForm.valueChanges.subscribe(
                data => this.onPasswordFormChanged({data})
            )
        );

        this.onBasicFormChanged();
    }

    private onBasicFormChanged(data?: any) {
        if (!this.basicInfoForm) {
            return;
        }
        const form = this.basicInfoForm;

        for (const field in this.basicInfoFormErrors) {
            // clear previous error message (if any)
            this.basicInfoFormErrors[field] = [];
            const control = form.get(field);

            if (control && control.dirty && !control.valid) {
                const messages = this._basicInfoValidationMessages[field];
                for (const key in control.errors) {
                    this.basicInfoFormErrors[field].push(messages[key]);
                }
            }
        }
    }

    private onPasswordFormChanged(data?: any) {
        if (!this.passwordForm) {
            return;
        }
        const form = this.passwordForm;
        for (const field in this.passwordFormErrors) {
            // clear previous error message (if any)
            this.passwordFormErrors[field] = [];
            const control = form.get(field);

            if (control && control.dirty && !control.valid) {
                const messages = this._passwordValidationMessages[field];
                for (const key in control.errors) {
                    this.passwordFormErrors[field].push(messages[key]);
                }
            }
        }
    }
}
