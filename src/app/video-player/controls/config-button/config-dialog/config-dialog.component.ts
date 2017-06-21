import { Component } from '@angular/core';
import { PersistStorage } from '../../../../user-service/persist-storage';
import { Capture } from '../../../core/settings';

@Component({
    selector: 'video-player-config-dialog',
    templateUrl: './config-dialog.html',
    styleUrls: ['./config-dialog.less']
})
export class VideoPlayerConfigDialog {
    private _directDownload: boolean;

    set directDownload(v: boolean) {
        this._directDownload = v;
        this._persistStorage.setItem(Capture.DIRECT_DOWNLOAD, v + '');
    }

    get directDownload(): boolean {
        return this._directDownload;
    }

    constructor(private _persistStorage: PersistStorage) {
        let savedDirectDownload = this._persistStorage.getItem(Capture.DIRECT_DOWNLOAD, 'false');
        this._directDownload = savedDirectDownload === 'true';
    }
}
