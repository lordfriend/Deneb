import {Component, ElementRef, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { UserService } from '../user-service/user.service';
import {BaseError} from '../../helpers/error/BaseError';

@Component({
    selector: 'forget-pass',
    templateUrl: './forget-pass.html',
    styleUrls: ['./forget-pass.less']
})
export class ForgetPass {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    @ViewChild('emailInput') emailInput: ElementRef;

    result: boolean = false;

    constructor(private _userService: UserService,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    onSubmit(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        let value = (this.emailInput.nativeElement as HTMLInputElement).value;
        this._subscription.add(this._userService.requestResetPass(value)
            .subscribe(
                () => {
                    this.result = true;
                },
                (error: BaseError) => {
                    this._toastRef.show(error.message);
                }
            ));
    }
}
