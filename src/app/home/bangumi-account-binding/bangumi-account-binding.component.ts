import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
    ChromeExtensionService,
    IAuthInfo,
    INITIAL_STATE_VALUE,
    LOGON_STATUS
} from '../../browser-extension/chrome-extension.service';
import { Subscription } from 'rxjs/Subscription';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'bangumi-account-binding',
    templateUrl: './bangumi-account-binding.html',
    styleUrls: ['./bangumi-account-binding.less']
})
export class BangumiAccountBindingComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    authInfo: IAuthInfo;

    authForm: FormGroup;

    isLogin = LOGON_STATUS.UNSURE;

    LOGON_STATUS = LOGON_STATUS;

    isAuthenticating = false;

    isLoading = true;

    constructor(private _chromeExtensionService: ChromeExtensionService,
                private _fb: FormBuilder,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    login(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.authForm.invalid) {
            return;
        }
        const value = this.authForm.value;
        this.isAuthenticating = true;
        this._chromeExtensionService.auth(value.username, value.password)
            .then((data) => {
                this._toastRef.show('已关联Bangumi账户');
                this.isAuthenticating = false;
            }, (error) => {
                this.isAuthenticating = false;
                this._toastRef.show(error.error);
            })
    }

    revokeAuth() {
        this._chromeExtensionService.revokeAuth()
            .then(() => {
                this._toastRef.show('已取消关联Bangumi账户');
            });
    }

    loginInBgmTv() {
        this._chromeExtensionService.openBgmForResult()
            .then(() => {
                this._toastRef.show('已完成登录');
            }, () => {
                this._toastRef.show('发生错误');
            });
    }

    ngOnInit(): void {
        this.authForm = this._fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        this._subscription.add(
            this._chromeExtensionService.authInfo
                .filter(authInfo => authInfo !== INITIAL_STATE_VALUE)
                .subscribe(authInfo => {
                    this.isLoading = false;
                    this.authInfo = authInfo as IAuthInfo;
                }, (error) => {
                    this.isLoading = false;
                    this._toastRef.show(error);
                })
        );
        this._subscription.add(
            this._chromeExtensionService.isBgmTvLogon
                .subscribe(status => {
                    this.isLogin = status;
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
