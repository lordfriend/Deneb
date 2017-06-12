import { Component, HostListener } from '@angular/core';
import { VideoCapture } from '../../core/video-capture.service';

@Component({
    selector: 'video-capture-button',
    template: '<i class="camera retro icon"></i>',
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
export class VideoCaptureButton {

    constructor(private _videoCapture: VideoCapture) {
    }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._videoCapture.capture();
    }
}
