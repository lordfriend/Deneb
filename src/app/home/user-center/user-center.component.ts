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
    templateUrl: './user-center.html'
})
export class UserCenter implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    user: User;

    basicInfoForm: FormGroup;
    passwordForm: FormGroup;

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
        }, { validator: passwordMatch('new_pass', 'new_pass_repeat') });
    }
}
