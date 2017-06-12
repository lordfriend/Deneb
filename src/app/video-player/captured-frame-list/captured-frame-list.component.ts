import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PreviewContainer, VideoCapture } from '../core/video-capture.service';

@Component({
    selector: 'video-captured-frame-list',
    templateUrl: './captured-frame-list.html',
    styleUrls: ['./captured-frame-list.less']
})
export class CapturedFrameList implements OnInit, OnDestroy, PreviewContainer {
    @ViewChild('wrapper') previewWrapper: ElementRef;

    constructor(private _videoCapture: VideoCapture) {
    }

    addImage(dataURI: string) {
        let previewWrapperElement = this.previewWrapper.nativeElement as HTMLElement;
        let image = new Image();
        image.src = dataURI;
        image.style.display = 'inline-block';
        image.style.width = 'auto';
        image.style.height = '100%';
        image.style.cursor = 'pointer';
        previewWrapperElement.appendChild(image);
    }

    ngOnInit(): void {
        this._videoCapture.registerPreviewContainer(this);
    }

    ngOnDestroy(): void {
        this._videoCapture.unregisterPreviewContainer();
    }

}
