
import {fromEvent as observableFromEvent,  Subscription ,  Observable } from 'rxjs';

import {filter} from 'rxjs/operators';
import { UIPopoverContent, UIPopoverRef } from 'deneb-ui';
import { Component, ElementRef, OnDestroy, Self } from '@angular/core';
import { UserActionPanelComponent } from '../../../../home/user-action/user-action-panel/user-action-panel.component';
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

    constructor(@Self() private _selfElementRef: ElementRef,
                popoverRef: UIPopoverRef<UserActionPanelComponent>,
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
            observableFromEvent(document.body, 'click').pipe(
                filter((event: MouseEvent) => {
                    const selfElement = this._selfElementRef.nativeElement as HTMLElement;
                    const rect = selfElement.getBoundingClientRect();
                    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
                }))
                .subscribe(() => {
                    // TODO: We need prevent clicking the player to avoid change playback state.
                    this.popoverRef.close(null);
                })
        );
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}
