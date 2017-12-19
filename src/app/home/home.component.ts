import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HomeService } from './home.service';
import { Observable, Subscription } from "rxjs/Rx";
import { User } from '../entity';
import { UserService } from '../user-service/user.service';
import { Bangumi } from '../entity/bangumi';
import { Router } from '@angular/router';
import { BaseError } from '../../helpers/error/BaseError';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { AlertDialog } from '../alert-dialog/alert-dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

const BREAK_POINT = 1330;

@Component({
    selector: 'home',
    templateUrl: './home.html',
    styleUrls: ['./home.less'],
    animations: [
        trigger('sidebarActive', [
            state('active', style({
                transform: 'translateX(0)'
            })),
            state('inactive', style({
                transform: 'translateX(-100%)'
            })),
            transition('inactive => active', animate('100ms ease-in')),
            transition('active => inactive', animate('100ms ease-out'))
        ])
    ]
})
export class Home implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    siteTitle: string = SITE_TITLE;

    currentRouteName: string = '';

    sidebarActive = 'active';

    sidebarOverlap: boolean = false;

    user: User;

    showFloatSearchFrame: boolean;

    sidebarToggle = new EventEmitter<string>();

    constructor(titleService: Title,
                toast: UIToast,
                dialogService: UIDialog,
                private _homeService: HomeService,
                private _userService: UserService,
                private _router: Router) {
        this._toastRef = toast.makeText();
        this.checkOverlapMode();
        if (this.sidebarOverlap) {
            this.sidebarActive = 'inactive';
        }
        _homeService.childRouteChanges.subscribe((routeName) => {
            if (routeName === 'Play' || routeName === 'PV') {
                this.sidebarActive = 'inactive';
            } else if (!this.sidebarOverlap) {
                this.sidebarActive = 'active';
            }

            if (routeName === 'Default' && this.user && (!this.user.email_confirmed || !this.user.email)) {
                console.log('please input your email');
                let dialogRef = dialogService.open(AlertDialog, {stickyDialog: true, backdrop: true});
                if (this.user.email && !this.user.email_confirmed) {
                    dialogRef.componentInstance.title = '请验证你的邮箱地址！';
                    dialogRef.componentInstance.content = '我们已经向您的邮箱地址发送了验证邮件，请前往您的邮箱查看该邮件并完成验证。';
                    dialogRef.componentInstance.confirmButtonText = '知道了';
                    this._subscription.add(dialogRef.afterClosed().subscribe(() => {}));
                } else {
                    dialogRef.componentInstance.title = '请填写您的邮箱地址！';
                    dialogRef.componentInstance.content = '我们检测到您还没有填写邮箱地址，使用邀请码重置密码功能已经关闭。请务必填写邮箱地址以保证正常使用';
                    dialogRef.componentInstance.confirmButtonText = '前往用户设置';
                    this._subscription.add(dialogRef.afterClosed().subscribe(() => {
                        this._router.navigate(['/settings/user']);
                    }));
                }
            }

            this.currentRouteName = routeName;

            if (routeName === 'Bangumi') {
                titleService.setTitle(`所有新番 - ${this.siteTitle}`);
            } else if (routeName === 'Default') {
                titleService.setTitle(this.siteTitle);
            }
        });
    }

    searchBangumi(name: string) {
        this._router.navigate(['/bangumi', {name: name}]);
    }

    toggleFloatSearchFrame() {
        this.showFloatSearchFrame = !this.showFloatSearchFrame;
    }

    onClickSidebar(event: Event) {
        if (!this.sidebarOverlap) {
            return true;
        }
        event.preventDefault();
        event.stopPropagation();
        this.sidebarActive = 'inactive';
        if (this.sidebarOverlap) {
            this.sidebarToggle.emit(this.sidebarActive);
        }
    }

    onClickSidebarBackdrop(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.sidebarActive = 'inactive';
        if (this.sidebarOverlap) {
            this.sidebarToggle.emit(this.sidebarActive);
        }
    }

    toggleSidebar(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.sidebarActive = this.sidebarActive === 'active' ? 'inactive': 'active';
        if (this.sidebarOverlap) {
            this.sidebarToggle.emit(this.sidebarActive);
        }
    }

    logout() {
        this._subscription.add(
            this._userService.logout()
                .subscribe(
                    () => {},
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    ngOnInit(): void {
        this._subscription.add(this._userService.userInfo
            .subscribe(
                (user: User) => {
                    this.user = user;
                }
            ));

        this._subscription.add(Observable.fromEvent(window, 'resize')
            .subscribe(
                () => {
                    this.checkOverlapMode();
                }
            ));
    }


    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }


    private checkOverlapMode() {
        let viewportWidth = window.innerWidth;
        this.sidebarOverlap = viewportWidth <= BREAK_POINT;
    }
}
