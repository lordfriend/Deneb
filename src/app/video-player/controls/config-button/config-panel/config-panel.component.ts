
import {fromEvent as observableFromEvent,  Subscription ,  Observable } from 'rxjs';

import {filter} from 'rxjs/operators';
import { UIPopoverContent, UIPopoverRef } from 'deneb-ui';
import { Component, ElementRef, OnDestroy, Self } from '@angular/core';
import { UserActionPanelComponent } from '../../../../home/user-action/user-action-panel/user-action-panel.component';
import { Capture, FloatPlayer, PlayList } from '../../../core/settings';
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
    private _autoFloatPlayWhenScroll: boolean;
    private _autoFloatPlayWhenLeave: boolean;

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

    set autoFloatPlayWhenScroll(v: boolean) {
        this._autoFloatPlayWhenScroll = v;
        this._persistStorage.setItem(FloatPlayer.AUTO_FLOAT_WHEN_SCROLL, v + '');
    }

    get autoFloatPlayWhenScroll(): boolean {
        return this._autoFloatPlayWhenScroll;
    }

    set autoFloatPlayWhenLeave(v: boolean) {
        this._autoFloatPlayWhenLeave = v;
        this._persistStorage.setItem(FloatPlayer.AUTO_FLOAT_WHEN_LEAVE, v + '');
    }

    get autoFloatPlayWhenLeave(): boolean {
        return this._autoFloatPlayWhenLeave;
    }

    constructor(@Self() private _selfElementRef: ElementRef,
                popoverRef: UIPopoverRef<UserActionPanelComponent>,
                private _persistStorage: PersistStorage) {
        super(popoverRef);
        const savedDirectDownload = this._persistStorage.getItem(Capture.DIRECT_DOWNLOAD, 'false');
        const autoPlayNext = this._persistStorage.getItem(PlayList.AUTO_PLAY_NEXT, 'true');
        const autoFloatPlayWhenScroll = this._persistStorage.getItem(FloatPlayer.AUTO_FLOAT_WHEN_SCROLL, 'true');
        const autoFloatPlayWhenLeave = this._persistStorage.getItem(FloatPlayer.AUTO_FLOAT_WHEN_LEAVE, 'true');
        this._directDownload = savedDirectDownload === 'true';
        this._autoPlayNext = autoPlayNext === 'true';
        this._autoFloatPlayWhenScroll = autoFloatPlayWhenScroll === 'true';
        this._autoFloatPlayWhenLeave = autoFloatPlayWhenLeave === 'true';
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
