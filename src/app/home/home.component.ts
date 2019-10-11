
import {fromEvent as observableFromEvent,  Observable, Subscription } from 'rxjs';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HomeService } from './home.service';
import { Bangumi, User } from '../entity';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AlertDialog } from '../alert-dialog/alert-dialog.component';
import { UIDialog } from 'deneb-ui';
import { UserService } from '../user-service';

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

    user: User;

    siteTitle: string = SITE_TITLE;

    currentRouteName: string = '';

    sidebarActive = 'active';

    sidebarOverlap: boolean = false;

    showFloatSearchFrame: boolean;

    sidebarToggle = new EventEmitter<string>();

    constructor(titleService: Title,
                private _homeService: HomeService,
                private _dialogService: UIDialog,
                private _userService: UserService,
                private _router: Router) {
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

    ngOnInit(): void {
        this._subscription.add(this._userService.userInfo
            .subscribe(
                (user: User) => {
                    this.user = user;
                    if (user && (!user.email_confirmed || !user.email)) {
                        console.log('please input your email');
                        let dialogRef = this._dialogService.open(AlertDialog, {stickyDialog: true, backdrop: true});
                        if (user.email && !user.email_confirmed) {
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
                }
            ));
        this._subscription.add(observableFromEvent(window, 'resize')
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
