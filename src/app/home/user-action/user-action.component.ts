
import { fromEvent as observableFromEvent, Subscription, Observable, throwError } from 'rxjs';

import {catchError, timeout, mergeMap, filter, tap} from 'rxjs/operators';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChromeExtensionService, INITIAL_STATE_VALUE } from '../../browser-extension/chrome-extension.service';
import { ExtensionRpcService } from '../../browser-extension/extension-rpc.service';
import { User } from '../../entity';
import { BaseError } from '../../../helpers/error';
import { PersistStorage, UserService } from '../../user-service';
import { UIPopover, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Router } from '@angular/router';
import { UserActionPanelComponent } from './user-action-panel/user-action-panel.component';
import { isChrome } from '../../../helpers/browser-detect';
import { BrowserExtensionTipComponent } from './browser-extension-tip/browser-extension-tip.component';

@Component({
    selector: 'user-action',
    templateUrl: './user-action.html',
    styleUrls: ['./user-action.less']
})
export class UserActionComponent implements OnInit, OnDestroy, AfterViewInit {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    @Input()
    user: User;

    isBangumiEnabled: boolean;

    bgmAccountInfo: {
        nickname: string,
        avatar: {large: string, medium: string, small: string},
        username: string,
        id: string,
        url: string
    };

    @ViewChild('userActionLink', {static: false}) userActionLinkRef: ElementRef;

    constructor(private _chromeExtensionService: ChromeExtensionService,
                private _extensionRpcService: ExtensionRpcService,
                private _userService: UserService,
                private _router: Router,
                private _popover: UIPopover,
                private _persistStorage: PersistStorage,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    logout() {
        this._userService.logout()
            .subscribe(
                () => {},
                (error: BaseError) => {
                    this._toastRef.show(error.message);
                }
            )
    }

    ngOnInit(): void {
        this._subscription.add(
            this._chromeExtensionService.isEnabled.pipe(
                tap(isEnabled => {
                    this.isBangumiEnabled = isEnabled;
                }),
                filter(isEnabled => isEnabled),)
                .subscribe(() => {
                    this._subscription.add(
                        this._chromeExtensionService.authInfo
                            .subscribe(authInfo => {
                                if (authInfo !== INITIAL_STATE_VALUE && authInfo !== null) {
                                    this.bgmAccountInfo = {
                                        username: authInfo.username,
                                        nickname: authInfo.nickname,
                                        avatar: authInfo.avatar,
                                        id: authInfo.id,
                                        url: authInfo.url
                                    };
                                } else if (authInfo === null) {
                                    this.bgmAccountInfo = null;
                                }
                            }));
                })
        );
    }

    ngAfterViewInit(): void {
        let userActionLinkElement = this.userActionLinkRef.nativeElement;
        this._subscription.add(
            observableFromEvent(userActionLinkElement, 'click').pipe(
                mergeMap(() => {
                    const popoverRef = this._popover.createPopover(userActionLinkElement, UserActionPanelComponent, 'bottom-end');
                    popoverRef.componentInstance.user = this.user;
                    popoverRef.componentInstance.isBangumiEnabled = this.isBangumiEnabled;
                    popoverRef.componentInstance.bgmAccountInfo = this.bgmAccountInfo;
                    return popoverRef.afterClosed();
                }),
                filter(result => !!result),)
                .subscribe((result) => {
                    if (result === 'logout') {
                        this.logout();
                    }
                    console.log(result);
                })
        );

        this._subscription.add(
            this._chromeExtensionService.isEnabled.pipe(
                filter(isEnabled => isEnabled),
                timeout(1000),
                catchError(() => {
                    let hasAcknowledged = this._persistStorage.getItem('USER_ACTION_HAS_ACKNOWLEDGED', null);
                    if (this._extensionRpcService.isExtensionEnabled() && !hasAcknowledged) {
                        const popoverRef = this._popover.createPopover(userActionLinkElement, BrowserExtensionTipComponent, 'bottom-end');
                        popoverRef.componentInstance.extensionId = this._extensionRpcService.extensionId;
                        popoverRef.componentInstance.firefoxExtensionUrl = FIREFOX_EXTENSION_URL;
                        return popoverRef.afterClosed();
                    }
                    return throwError('extension not enabled');
                }),)
                .subscribe(() => {
                    this._persistStorage.setItem('USER_ACTION_HAS_ACKNOWLEDGED', 'true');
                }, (error) => {
                    console.log(error);
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
