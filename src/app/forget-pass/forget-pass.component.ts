import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { UserService } from '../user-service/user.service';

@Component({
    selector: 'forget-pass',
    templateUrl: './forget-pass.html'
})
export class ForgetPass {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    constructor(private _userService: UserService, toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    onSubmit() {
        // this._userService.resetPassword()
    }
}
