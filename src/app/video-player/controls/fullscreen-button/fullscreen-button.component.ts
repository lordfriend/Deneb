import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { VideoPlayer } from '../../video-player.component';
import { Subscription } from 'rxjs/Subscription';
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
        this._videoPlayer.toggleFullscreen();
    }
}
