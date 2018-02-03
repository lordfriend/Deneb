import { Injectable } from '@angular/core';
import { WatchService } from '../watch.service';
import {
    ChromeExtensionService, INITIAL_STATE_VALUE,
    LOGON_STATUS
} from '../../browser-extension/chrome-extension.service';
import { UIDialog } from 'deneb-ui';
import { HomeService } from '../home.service';
import { Observable } from 'rxjs/Observable';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';
import { Bangumi } from '../../entity';

@Injectable()
export class SynchronizeService {

    private _cache = new Map<string, any>();

    constructor(private watchService: WatchService,
                private homeService: HomeService,
                private _dialog: UIDialog,
                private _chromeExtensionService: ChromeExtensionService,) {
    }

    updateFavorite(bangumi: Bangumi, favStatus: any) {
        return this._chromeExtensionService.updateFavoriteAndSync(bangumi, favStatus)
            .do(() => {
                this._cache.delete(bangumi.id);
            });
    }

    deleteFavorite(bangumi: Bangumi) {
        return this._chromeExtensionService.deleteFavoriteAndSync(bangumi)
            .do(() => {
                this._cache.delete(bangumi.id);
            });
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
            });
    }
}
