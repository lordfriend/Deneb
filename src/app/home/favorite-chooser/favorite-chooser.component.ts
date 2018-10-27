import { Bangumi } from '../../entity';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { BANGUMI_TYPE, FAVORITE_LABEL } from '../../entity/constants';
import { WatchService } from '../watch.service';
import { HomeService } from '../home.service';
import { EditReviewDialogComponent } from '../rating/edit-review-dialog/edit-review-dialog.component';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs/Subscription';
import { AuthInfo, ChromeExtensionService, LOGON_STATUS } from '../../browser-extension/chrome-extension.service';
import { SynchronizeService } from './synchronize.service';

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

    constructor(private watchService: WatchService,
                private homeService: HomeService,
                private _dialog: UIDialog,
                private _chromeExtensionService: ChromeExtensionService,
                private _synchronize: SynchronizeService,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    onEditReview() {
        const dialogRef = this._dialog.open(EditReviewDialogComponent, {backdrop: true, stickyDialog: true});
        dialogRef.componentInstance.comment = this.userFavoriteInfo ? this.userFavoriteInfo.comment : '';
        dialogRef.componentInstance.rating = this.userFavoriteInfo ? this.userFavoriteInfo.rating : 0;
        dialogRef.componentInstance.tags = this.userFavoriteInfo ? (Array.isArray(this.userFavoriteInfo.tags) ? this.userFavoriteInfo.tags.join(' ') : '') : '';
        dialogRef.componentInstance.bangumi = this.bangumi;
        this._subscription.add(dialogRef.afterClosed()
            .filter(result => !!result)
            .flatMap((result) => {
                this.isOnSynchronizing = true;
                /**
                 * export interface FavoriteStatus {
                 *      interest: number;
                 *      rating: number;
                 *      tags: string;
                 *      comment: string;
                 * }
                 */
                return this._synchronize.updateFavorite(this.bangumi, result);
            })
            .flatMap(() => {
                return this._chromeExtensionService.invokeBangumiMethod('favoriteStatus', [this.bangumi.bgm_id]);
            })
            .subscribe((result) => {
                console.log(result);
                this.isOnSynchronizing = false;
                this.userFavoriteInfo = result;
                this.bangumi.favorite_status = result.status.id;
                this.homeService.changeFavorite();
            }, (error) => {
                console.log(error);
                if (error && error.status === 404) {
                    this.bangumi.favorite_status = 0;
                    this.userFavoriteInfo = null;
                    this.homeService.changeFavorite();
                }
                this.isOnSynchronizing = false;
                this._toastRef.show('更新失败');
            })
        );
    }

    deleteFavorite() {
        this.isOnSynchronizing = true;
        if (this.syncEnabled) {
            this._subscription.add(
                this._synchronize.deleteFavorite(this.bangumi)
                    .do(() => {
                        this.homeService.changeFavorite();
                    })
                    .subscribe(() => {
                        this.isOnSynchronizing = false;
                        this.bangumi.favorite_status = 0;
                        this.userFavoriteInfo = null;
                        this._toastRef.show('已删除收藏');
                        this.homeService.changeFavorite();
                    }, () => {
                        this.isOnSynchronizing = false;
                    })
            );
        } else {
            this._subscription.add(
                this.watchService.delete_favorite(this.bangumi.id)
                    .subscribe(() => {
                        this.isOnSynchronizing = false;
                        this.homeService.changeFavorite();
                        this.bangumi.favorite_status = undefined;
                        this._toastRef.show('已删除收藏');
                        this.homeService.changeFavorite();
                    }, () => {
                        this.isOnSynchronizing = false;
                    })
            );
        }
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
        this.watchService.favorite_bangumi(this.bangumi.id, status)
            .subscribe(() => {
                this.bangumi.favorite_status = status;
                this.homeService.changeFavorite();
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
            this._chromeExtensionService.isEnabled
                .do(isEnabled => {
                    this.isExtensionEnabled = isEnabled;
                })
                .filter(isEnabled => isEnabled)
                .flatMap(() => {
                    return this._chromeExtensionService.authInfo;
                })
                .do(authInfo => {
                    this.authInfo = authInfo;
                })
                .filter(authInfo => !!authInfo)
                .flatMap(() => {
                    return this._chromeExtensionService.isBgmTvLogon;
                })
                .do(isLogin => {
                    this.isBgmLogin = isLogin;
                    if (this.isBgmLogin === LOGON_STATUS.TRUE && !!this.authInfo) {
                        this.toggleButtonText = '收藏/评价';
                    } else {
                        this.toggleButtonText = '收藏';
                    }
                })
                .filter(isLogin => isLogin === LOGON_STATUS.TRUE)
                .flatMap(() => {
                    return this._synchronize.syncBangumi(this.bangumi);
                })
                .subscribe(result => {
                    this.isOnSynchronizing = false;
                    this.userFavoriteInfo = result.data;
                    if (result.data && result.data.status && result.data.status.id) {
                        this.bangumi.favorite_status = result.data.status.id;
                    }
                    if (result.progressResult && result.progressResult.status === 0) {
                        this.reloadEpisodes.emit(true);
                    }
                    console.log(result);
                }, (error) => {
                    console.log(error);
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
