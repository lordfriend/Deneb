import {Component, HostListener, Input} from '@angular/core';
import {VideoPlayer} from '../../video-player.component';
@Component({
    selector: 'video-fullscreen-button',
    template: `<i class="icon" [ngClass]="{expand: !isFullscreen, compress: isFullscreen}"></i>`,
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
export class VideoFullscreenButton {

    @Input()
    controlVisibleState: boolean;

    get isFullscreen() {
        if (this._videoPlayer) {
            return this._videoPlayer.isFullscreen;
        }
        return false;
    }

    constructor(private _videoPlayer: VideoPlayer) {
    }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.controlVisibleState) {
            return;
        }
        this._videoPlayer.toggleFullscreen();
    }
}
