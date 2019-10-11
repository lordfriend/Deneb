import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators';
import { filter, mergeMap, tap } from 'rxjs/operators';
import { AuthInfo, ChromeExtensionService, LOGON_STATUS } from '../../browser-extension/chrome-extension.service';
import { Bangumi } from '../../entity';
import { BANGUMI_TYPE, FAVORITE_LABEL } from '../../entity/constants';
import { FavoriteManagerService } from '../favorite-manager.service';
import { HomeService } from '../home.service';
import { EditReviewDialogComponent } from '../rating/edit-review-dialog/edit-review-dialog.component';
import { WatchService } from '../watch.service';
import { SynchronizeService } from '../synchronize.service';

@Component({
    selector: 'favorite-chooser',
    templateUrl: './favorite-chooser.html',
    styleUrls: ['./favorite-chooser.less'],
    encapsulation: ViewEncapsulation.None
})
export class FavoriteChooser implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    FAVORITE_LABEL = FAVORITE_LABEL;
    BANGUMI_TYPE = BANGUMI_TYPE;

    isChoosingFavorite = false;
    isSavingFavorite = false;

    toggleButtonText = '收藏';

    @Input()
    bangumi: Bangumi;

    isExtensionEnabled: boolean;
    authInfo: AuthInfo;
    isBgmLogin = LOGON_STATUS.UNSURE;

    get syncEnabled(): boolean {
        return this.isExtensionEnabled && !!this.authInfo && this.isBgmLogin === LOGON_STATUS.TRUE;
    }

    @Input()
    loadBgmInfo: boolean;

    @Output()
    reloadEpisodes = new EventEmitter<any>();

    userFavoriteInfo: any;

    isOnSynchronizing: boolean;

    constructor(private _dialog: UIDialog,
                private _chromeExtensionService: ChromeExtensionService,
                private _favoriteManagerService: FavoriteManagerService,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    onEditReview() {
        const dialogRef = this._dialog.open(EditReviewDialogComponent, {backdrop: true, stickyDialog: true});
        dialogRef.componentInstance.comment = this.userFavoriteInfo ? this.userFavoriteInfo.comment : '';
        dialogRef.componentInstance.rating = this.userFavoriteInfo ? this.userFavoriteInfo.rating : 0;
        dialogRef.componentInstance.tags = this.userFavoriteInfo ? (Array.isArray(this.userFavoriteInfo.tags) ? this.userFavoriteInfo.tags.join(' ') : '') : '';
        dialogRef.componentInstance.bangumi = this.bangumi;
        this._subscription.add(dialogRef.afterClosed().pipe(
            filter(result => !!result),
            switchMap((result) => {
                this.isOnSynchronizing = true;
                /**
                 * export interface FavoriteStatus {
                 *      interest: number;
                 *      rating: number;
                 *      tags: string;
                 *      comment: string;
                 * }
                 */
                return this._favoriteManagerService.manuallyChangeFavorite(this.bangumi, result);
            }),)
            .subscribe((result) => {
                console.log(result);
                this.isOnSynchronizing = false;
                this.userFavoriteInfo = result;
            }, (error) => {
                console.log(error);
                if (error && error.status === 404) {
                    this.bangumi.favorite_status = 0;
                    this.userFavoriteInfo = null;
                }
                this.isOnSynchronizing = false;
                this._toastRef.show('更新失败');
            })
        );
    }

    deleteFavorite() {
        this.isOnSynchronizing = true;
        this._subscription.add(
            this._favoriteManagerService.manuallyDeleteFavorite(this.bangumi)
                .subscribe(() => {
                    this.isOnSynchronizing = false;
                    this.bangumi.favorite_status = 0;
                    this.userFavoriteInfo = null;
                    this._toastRef.show('已删除收藏');
                }, () => {
                    this.isOnSynchronizing = false;
                })
        );
    }

    toggleFavoriteChooser() {
        if (this.syncEnabled) {
            this.onEditReview();
        } else {
            this.isChoosingFavorite = !this.isChoosingFavorite;
        }
    }

    chooseFavoriteStatus(status) {
        this.isChoosingFavorite = false;
        this.isSavingFavorite = true;
        this.bangumi.favorite_status = status;
        this._favoriteManagerService.manuallyChangeFavorite(this.bangumi)
            .subscribe(() => {
                console.log('update favorite successful');
            }, () => {
                console.log('update favorite error');
            }, () => {
                this.isSavingFavorite = false;
            });
    }

    ngOnInit(): void {
        this.isOnSynchronizing = true;
        this._subscription.add(
            this._chromeExtensionService.isEnabled.pipe(
                tap(isEnabled => {
                    this.isExtensionEnabled = isEnabled;
                }),
                filter(isEnabled => isEnabled),
                switchMap(() => {
                    return this._chromeExtensionService.authInfo;
                }),
                tap(authInfo => {
                    this.authInfo = authInfo;
                }),
                filter(authInfo => !!authInfo),
                switchMap(() => {
                    return this._chromeExtensionService.isBgmTvLogon;
                }),
                tap(isLogin => {
                    this.isBgmLogin = isLogin;
                    if (this.isBgmLogin === LOGON_STATUS.TRUE && !!this.authInfo) {
                        this.toggleButtonText = '收藏/评价';
                    } else {
                        this.toggleButtonText = '收藏';
                    }
                }),
                filter(isLogin => isLogin === LOGON_STATUS.TRUE),
                switchMap(() => {
                    return this._favoriteManagerService.resyncBangumi(this.bangumi);
                }),)
                .subscribe(result => {
                    this.isOnSynchronizing = false;
                    this.userFavoriteInfo = result.data;
                    if (result.progressResult && result.progressResult.status === 0) {
                        this.reloadEpisodes.emit(true);
                    }
                    console.log(result);
                }, (error) => {
                    console.log(error);
                })
        );
        this._subscription.add(
            this._favoriteManagerService.favoriteChanged
                .subscribe(bangumi => {
                    if (bangumi.id === this.bangumi.id) {
                        this.bangumi = bangumi;
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
