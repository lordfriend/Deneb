import { UIPopoverContent, UIPopoverRef } from 'deneb-ui';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UserActionPanelComponent } from '../../../../home/user-action/user-action-panel/user-action-panel.component';
import { Observable } from 'rxjs/Observable';
import { Capture, PlayList } from '../../../core/settings';
import { PersistStorage } from '../../../../user-service';

@Component({
    selector: 'video-config-panel',
    templateUrl: './config-panel.html',
    styleUrls: ['./config-panel.less']
})
export class VideoConfigPanelComponent extends UIPopoverContent implements OnDestroy {
    private _subscription = new Subscription();
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

    constructor(popoverRef: UIPopoverRef<UserActionPanelComponent>,
                private _persistStorage: PersistStorage) {
        super(popoverRef);
        let savedDirectDownload = this._persistStorage.getItem(Capture.DIRECT_DOWNLOAD, 'false');
        let autoPlayNext = this._persistStorage.getItem(PlayList.AUTO_PLAY_NEXT, 'true');
        this._directDownload = savedDirectDownload === 'true';
        this._autoPlayNext = autoPlayNext === 'true';
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this._subscription.add(
            Observable.fromEvent(document.body, 'click')
                // .skip(1)
                .subscribe(() => {
                    this.popoverRef.close(null);
                })
        );
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}
