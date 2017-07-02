import { Component, HostListener } from '@angular/core';
import { UIDialog } from 'deneb-ui';
import { VideoPlayerConfigDialog } from './config-dialog/config-dialog.component';
import { VideoControls } from '../controls.component';
import { VideoPlayer } from '../../video-player.component';

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
export class VideoPlayerConfigButton {

    constructor(private _dialogService: UIDialog,
                private _controls: VideoControls,
                private _videoPlayer: VideoPlayer) {
    }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._dialogService.open(VideoPlayerConfigDialog, {
            stickyDialog: false,
            backdrop: true
        }, this._controls.controlWrapper)
            .afterClosed()
            .subscribe(() => {
                this._videoPlayer.requestFocus();
            });
    }
}

