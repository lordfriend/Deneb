import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { UserService } from '../user-service/user.service';
import {BaseError} from '../../helpers/error/BaseError';
import { ClientError } from '../../helpers/error/ClientError';

@Component({
    selector: 'forget-pass',
    templateUrl: './forget-pass.html',
    styleUrls: ['./forget-pass.less']
})
export class ForgetPass implements OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    @ViewChild('emailInput') emailInput: ElementRef;

    result = false;
    isPending = false;

    constructor(private _userService: UserService,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    onSubmit(event: Event) {
        if (this.isPending) {
            return;
        }
        this.isPending = true;
        event.stopPropagation();
        event.preventDefault();
        let value = (this.emailInput.nativeElement as HTMLInputElement).value;
        this._subscription.add(this._userService.requestResetPass(value)
            .subscribe(
                () => {
                    this.isPending = false;
                    this._toastRef.show(`重置密码链接发送到${value}`)
                    this.result = true;
                },
                (error: BaseError) => {
                    this.isPending = false;
                    if (error.message === ClientError.MAIL_NOT_EXISTS) {
                        this._toastRef.show('邮件地址不错在或错误');
                    } else {
                        this._toastRef.show(error.message);
                    }
                }
            ));
    }
}
