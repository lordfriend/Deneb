import { Component, ElementRef, HostListener, OnDestroy, Self } from '@angular/core';
import { UIPopover, UIPopoverRef } from 'deneb-ui';
import { VideoControls } from '../controls.component';
import { VideoPlayer } from '../../video-player.component';
import { VideoConfigPanelComponent } from './config-panel/config-panel.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'video-player-config-button',
    template: '<i class="setting icon"></i>',
    styles: [`
        :host {
            display: inline-block;
            box-sizing: border-box;
            flex: 0 0 auto;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
            padding: 0.4rem;
            cursor: pointer;
            line-height: 1;
        }
    `]
})
export class VideoPlayerConfigButton implements OnDestroy {
    private _subscription = new Subscription();
    private _configPanelOpen = false;
    private _popoverRef: UIPopoverRef<VideoConfigPanelComponent>;

    constructor(private _controls: VideoControls,
                private _popover: UIPopover,
                private _videoPlayer: VideoPlayer,
                @Self() private _host: ElementRef) {
    }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        // this._dialogService.open(VideoPlayerConfigDialog, {
        //     stickyDialog: false,
        //     backdrop: true
        // }, this._controls.controlWrapper)
        //     .afterClosed()
        //     .subscribe(() => {
        //         this._videoPlayer.requestFocus();
        //     });
        if (this._configPanelOpen) {
            this._popoverRef.close();
            this._controls.onMotion();
            return;
        }
        this._controls.keepShow(true);
        this._popoverRef = this._popover.createPopover(this._host.nativeElement, VideoConfigPanelComponent, 'top');
        this._configPanelOpen = true;
        this._subscription.add(
            this._popoverRef.afterClosed()
                .subscribe(() => {
                    this._configPanelOpen = false;
                    this._controls.keepShow(false);
                    this._videoPlayer.requestFocus();
                })
        );

    }

    ngOnDestroy(): void {
        this._controls.keepShow(false);
        this._subscription.unsubscribe();
    }

}

