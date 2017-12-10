import { Component } from '@angular/core';
import { PersistStorage } from '../../../../user-service/persist-storage';
import { PlayList, Capture } from '../../../core/settings';

@Component({
    selector: 'video-player-config-dialog',
    templateUrl: './config-dialog.html',
    styleUrls: ['./config-dialog.less']
})
export class VideoPlayerConfigDialog {
    private _directDownload: boolean;
    private _autoPlayNext: boolean;

    set directDownload(v: boolean) {
        this._directDownload = v;
        this._persistStorage.setItem(Capture.DIRECT_DOWNLOAD, v + '');
    }

    get directDownload(): boolean {
        return this._directDownload;
    }

    set autoPlayNext(v: boolean) {
        this._autoPlayNext = v;
        this._persistStorage.setItem(PlayList.AUTO_PLAY_NEXT, v + '');
    }

    get autoPlayNext(): boolean {
        return this._autoPlayNext;
    }

    constructor(private _persistStorage: PersistStorage) {
        let savedDirectDownload = this._persistStorage.getItem(Capture.DIRECT_DOWNLOAD, 'false');
        let autoPlayNext = this._persistStorage.getItem(PlayList.AUTO_PLAY_NEXT, 'true');
        this._directDownload = savedDirectDownload === 'true';
        this._autoPlayNext = autoPlayNext === 'true';
    }
}
