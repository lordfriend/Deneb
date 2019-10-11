import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { passwordMatch } from '../form-utils';
import { Router } from '@angular/router';
import { UserService } from '../user-service';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { BaseError } from '../../helpers/error';
@Component({
    selector: 'reset-pass',
    templateUrl: './reset-pass.html',
    styleUrls: ['./reset-pass.less']
})
export class ResetPass implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    passForm: FormGroup;
    token: string;
    passValidationMessages = {
        new_pass: {
            'required': '新密码不能为空'
        },
        new_pass_repeat: {
            'required': '重复密码不能为空'
        }
    };
    passFormErrors = {
        new_pass: [],
        new_pass_repeat: []
    };

    isPending = false;

    constructor(_fb: FormBuilder,
                toast: UIToast,
                private _router: Router,
                private _userService: UserService) {
        this._toastRef = toast.makeText();
        this.passForm = _fb.group({
            new_pass: ['', Validators.required],
            new_pass_repeat: ['', Validators.required]
        }, {validator: passwordMatch('new_pass', 'new_pass_repeat')});
        this.onFormChanged(this.passFormErrors, this.passValidationMessages, this.passForm);
    }

    ngOnInit(): void {
        let searchString = window.location.search;
        if (searchString) {
            let params = new URLSearchParams(searchString.substring(1, searchString.length));
            let token = params.get('token');
            if (token) {
                this.token = token;
                return;
            }
        }
        this._router.navigate(['/error'])
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    onSubmit() {
        if (this.isPending) {
            return;
        }
        this.isPending = true;
        let value = this.passForm.value;
        this._subscription.add(
            this._userService.resetPassword(value.new_pass, value.new_pass_repeat, this.token)
                .subscribe(
                    () => {
                        this.isPending = false;
                        this.passForm.markAsPristine();
                        this._toastRef.show('重置密码成功');
                        this._router.navigateByUrl('/');
                    },
                    (error: BaseError) => {
                        this.isPending = false;
                        this._toastRef.show(error.message);
                    }
                )
        )
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
}
