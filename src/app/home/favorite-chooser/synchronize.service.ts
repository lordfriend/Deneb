import { Injectable } from '@angular/core';
import { WatchService } from '../watch.service';
import { ChromeExtensionService, LOGON_STATUS } from '../../browser-extension/chrome-extension.service';
import { UIDialog } from 'deneb-ui';
import { Observable } from 'rxjs/Observable';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';
import { Bangumi } from '../../entity';

@Injectable()
export class SynchronizeService {

    private _cache = new Map<string, any>();

    constructor(private _watchService: WatchService,
                private _dialog: UIDialog,
                private _chromeExtensionService: ChromeExtensionService,) {
    }

    updateFavorite(bangumi: Bangumi, favStatus: any): Observable<any> {
        return this._chromeExtensionService.updateFavoriteAndSync(bangumi, favStatus)
            .do(() => {
                this._cache.delete(bangumi.id);
            });
    }

    deleteFavorite(bangumi: Bangumi): Observable<any> {
        return this._chromeExtensionService.deleteFavoriteAndSync(bangumi)
            .do(() => {
                this._cache.delete(bangumi.id);
            });
    }

    updateFavoriteStatus(bangumi: Bangumi, status: number): Observable<any> {
        let cachedItem = this._cache.get(bangumi.id);
        if (cachedItem) {
            return this.updateFavorite(bangumi, {
                interest: status,
                rating: cachedItem.data.rating,
                comment: cachedItem.data.comment,
                tags: cachedItem.data.tag.join(',')
            });
        }
        return this._chromeExtensionService.invokeBangumiMethod('favoriteStatus', [bangumi.id])
            .flatMap((userFavoriteInfo) => {
                return this.updateFavorite(bangumi, {
                    interest: status,
                    rating: userFavoriteInfo.rating,
                    comment: userFavoriteInfo.comment,
                    tags: userFavoriteInfo.tag.join(',')
                });
            })
            .catch((error) => {
                if (error.status === 404) {
                    return this.updateFavorite(bangumi, {
                        interest: status,
                        rating: 0,
                        comment: '',
                        tags: ''
                    });
                }
                return Observable.throw(error);
            })
    }

    syncBangumi(bangumi: Bangumi) {
        let cachedItem = this._cache.get(bangumi.id);
        if (cachedItem) {
            return Observable.of(cachedItem);
        }
        return this._chromeExtensionService.syncBangumi(bangumi)
            .flatMap((result) => {
                if (result.status === 1) {
                    let dialogRef = this._dialog.open(ConflictDialogComponent, {stickyDialog: true, backdrop: true});
                    dialogRef.componentInstance.bangumiName = bangumi.name_cn || bangumi.name;
                    dialogRef.componentInstance.siteStatus = result.diff.albireo;
                    dialogRef.componentInstance.bgmStatus = result.diff.bgm;
                    return dialogRef.afterClosed()
                        .flatMap((choice) => {
                            return this._chromeExtensionService.solveConflict(bangumi, result.diff.bgm, choice)
                                .flatMap((data) => {
                                    if (choice === 'site') {
                                        return Observable.of({status: 0, data: data});
                                    }
                                    return Observable.of({status: 0, data: result.data});
                                });
                        });
                } else {
                    this._cache.set(bangumi.id, result);
                    return Observable.of(result);
                }
            })
            .flatMap((result) => {
                if (result.data && result.data.status && result.data.status.id) {
                    bangumi.favorite_status = result.data.status.id;
                }
                if (Array.isArray(bangumi.episodes) && bangumi.episodes.length > 0) {
                    return this.syncProgress(bangumi)
                        .flatMap((progressResult) => {
                            return Observable.of(Object.assign({progressResult: progressResult}, result));
                        });
                }
                return Observable.of(result);
            });
    }

    syncProgress(bangumi: Bangumi): Observable<any> {
        return this._chromeExtensionService.syncProgress(bangumi);
    }
}
