import { Injectable } from '@angular/core';
import { UIToast } from 'deneb-ui';
import { Observable, of as observableOf, Subject, throwError as observableThrowError } from 'rxjs/index';
import { filter, map, switchMap, tap } from 'rxjs/internal/operators';
import { catchError } from 'rxjs/operators';
import { BaseService } from '../../helpers/base.service';
import {
    ChromeExtensionService,
    ENABLED_STATUS,
    INITIAL_STATE_VALUE,
    LOGON_STATUS
} from '../browser-extension/chrome-extension.service';
import { Bangumi } from '../entity';
import { WatchProgress } from '../entity/watch-progress';
import { VideoPlayerService } from '../video-player/video-player.service';
import { SynchronizeService } from './synchronize.service';
import { WatchService } from './watch.service';

@Injectable()
export class FavoriteManagerService extends BaseService {
    private _favoriteChanged = new Subject<Bangumi>();

    get favoriteChanged(): Observable<Bangumi> {
        return this._favoriteChanged.asObservable();
    }

    constructor(private _chromeExtensionService: ChromeExtensionService,
                private _watchService: WatchService,
                private _synchronizeService: SynchronizeService,
                videoPlayerService: VideoPlayerService,
                uiToastService: UIToast) {
        super();

        const toastRef = uiToastService.makeText();
        this.canSync()
            .pipe(
                filter(result => result.canSync),
                switchMap(() => {
                    return videoPlayerService.onWatchStatusChanges;
                }),
                filter(episode => episode.watch_progress && episode.watch_progress.watch_status === WatchProgress.WATCHED),
                switchMap(episode => {
                    return this._chromeExtensionService.invokeBangumiMethod('updateEpisodeStatus', [episode.bgm_eps_id, 'watched']);
                })
            )
            .subscribe(result => {
                console.log('episode progress synchronized', result);
                toastRef.show('已与Bangumi同步');
            });

        this.canSync()
            .pipe(
                switchMap((result) => {
                    return videoPlayerService.onBangumiFavoriteChange
                        .pipe(switchMap(bangumi => {
                            if (result.canSync) {
                                return this._synchronizeService.updateFavoriteStatus(bangumi, Bangumi.WATCHED).pipe(
                                    map(() => {
                                        toastRef.show('已与Bangumi同步');
                                        return bangumi;
                                    }));
                            } else {
                                return this._watchService.favorite_bangumi(bangumi.id, Bangumi.WATCHED)
                                    .pipe(map(() => {
                                        return bangumi;
                                    }));
                            }
                        }));
                })
            )
            .subscribe((bangumi) => {
                this._favoriteChanged.next(bangumi);
                // this.changeFavorite();
            })
    }

    manuallyChangeFavorite(bangumi: Bangumi, favStatus?: any): Observable<any> {
        return this.canSync().pipe(
            switchMap((result) => {
                if (result.canSync) {
                    return this._synchronizeService.updateFavorite(bangumi, favStatus).pipe(
                        switchMap(() => {
                            return this._chromeExtensionService.invokeBangumiMethod('favoriteStatus', [bangumi.bgm_id]);
                        }),
                        tap(result => {
                            if (result.status) {
                                bangumi.favorite_status = result.status.id;
                            }
                        })
                    );
                } else {
                    return this._watchService.favorite_bangumi(bangumi.id, bangumi.favorite_status);
                }
            }),
            tap(() => {
                this._favoriteChanged.next(bangumi);
            })
        )
    }

    manuallyDeleteFavorite(bangumi: Bangumi): Observable<any> {
        return this.canSync().pipe(
            switchMap(result => {
                if (!result.canSync) {
                    return this._watchService.delete_favorite(bangumi.id);
                } else {
                    return this._synchronizeService.deleteFavorite(bangumi);
                }
            }),
            tap(() => {
                bangumi.favorite_status = 0;
                this._favoriteChanged.next(bangumi);
            })
        );
    }

    resyncBangumi(bangumi: Bangumi): Observable<any> {
        return this._synchronizeService.syncBangumi(bangumi)
            .pipe(tap((result) => {
                if (result.data && result.data.status && result.data.status.id) {
                    bangumi.favorite_status = result.data.status.id;
                    this._favoriteChanged.next(bangumi);
                }
            }));
    }

    private canSync(): Observable<{ canSync: boolean }> {
        return this._chromeExtensionService.isEnabled.pipe(
            filter(isEnabled => isEnabled !== ENABLED_STATUS.UNSURE),
            switchMap((isEnabled) => {
                if (isEnabled === ENABLED_STATUS.FALSE) {
                    return observableThrowError({canSync: false});
                }
                return this._chromeExtensionService.authInfo;
            }),
            filter(authInfo => authInfo !== INITIAL_STATE_VALUE),
            switchMap((authInfo) => {
                if (!authInfo) {
                    return observableThrowError({canSync: false});
                }
                return this._chromeExtensionService.isBgmTvLogon;
            }),
            filter(isBgmLogon => isBgmLogon !== LOGON_STATUS.UNSURE),
            switchMap((isBgmLogon) => {
                if (isBgmLogon !== LOGON_STATUS.TRUE) {
                    return observableThrowError({canSync: false});
                }
                return observableOf({canSync: true});
            }),
            catchError((error) => {
                return observableOf(error);
            }),);
    }
}
