import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserManagerSerivce} from './user-manager.service';
import {UIDialog, UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {Subscription} from 'rxjs/Subscription';
import {User} from '../../entity/user';
import {BaseError} from '../../../helpers/error/BaseError';
import {UserPromoteModal} from './user-promote-modal/user-promote-modal.component';
import {ClientError} from '../../../helpers/error/ClientError';
import {UserService} from '../../user-service/user.service';

@Component({
    selector: 'user-manager',
    templateUrl: './user-manager.html',
    styleUrls: ['./user-manager.less']
})
export class UserManager implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    userPage = 1;
    userTotal = 0;
    userCount = 10;

    userList: User[];

    inviteCodeList: string[];
    inviteCodeNum = 1;

    currentAdmin: User;

    constructor(
        private _userService: UserService,
        private _userManageService: UserManagerSerivce,
        private _dialog: UIDialog,
        toast: UIToast
    ) {
        this._toastRef = toast.makeText();
    }

    ngOnInit(): void {
        this._subscription.add(
            this._userService.userInfo
                .subscribe(
                    user => {
                        this.currentAdmin = user;
                    }
                )
        );
        this.getUserList(this.userPage);
        this.getInviteCodeList();
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    getUserList(page) {
        let offset = (page - 1) * this.userCount;
        this._subscription.add(
            this._userManageService.listUser({
                offset: offset,
                count: this.userCount,
                minlevel: 0
            })
                .subscribe(
                    (result) => {
                        this.userList = result.data;
                        this.userTotal = result.total;
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    getInviteCodeList() {
        this._subscription.add(
            this._userManageService.listUnusedInviteCode()
                .subscribe(
                    (result) => {
                        this.inviteCodeList = result;
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    shareCode(code: string) {
        let url = `${location.protocol}//${location.host}/register?invite=${code}`;
        let inputElement = document.createElement('input') as HTMLInputElement;
        inputElement.style.opacity = '0.1';
        document.body.appendChild(inputElement);
        inputElement.value = url;
        inputElement.select();
        document.execCommand('copy');
        console.log('inviteCode: ', url);
        this._toastRef.show('邀请链接已经复制到剪贴板');
        document.body.removeChild(inputElement);
    }

    generateInviteCode() {
        this._subscription.add(
            this._userManageService.createInviteCode(Math.abs(Math.floor(this.inviteCodeNum)))
                .subscribe(
                    () => {
                        this.getInviteCodeList();
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    promoteUser(user: User) {
        let dialogRef = this._dialog.open(UserPromoteModal, {stickyDialog: false, backdrop: true});
        dialogRef.componentInstance.level = user.level;
        this._subscription.add(
            dialogRef.afterClosed()
                .filter(result => !!result)
                .flatMap(result => {
                    return this._userManageService.promoteUser(user.id, result.level);
                })
                .subscribe(
                    () => {
                        this._toastRef.show('更改用户等级成功');
                        this.getUserList(this.userPage);
                    },
                    (error: BaseError) => {
                        if (error instanceof ClientError && error.status === 404) {
                            this._toastRef.show('未找到用户');
                        } else {
                            this._toastRef.show(error.message);
                        }
                    }
                )
        );
    }
}
