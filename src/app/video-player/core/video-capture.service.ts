import { Injectable } from '@angular/core';

export interface PreviewContainer {
    /**
     * invoked by VideoCapture, implement class should use the given data uri generate a preview image.
     * @param dataURI - converted image by calling toDataURI with captured frame in canvas
     */
    addImage(dataURI: string);
}

@Injectable()
export class VideoCapture {

    imageFormat: string = 'png';

    downloadSupport: boolean;

    private _previewContainer: PreviewContainer = null;
    private _videoElement: HTMLVideoElement = null;

    constructor() {
        let testAnchor = document.createElement('a');
        this.downloadSupport = typeof testAnchor['download'] !== 'undefined';
    }

    /**
     * capture an draw without return.
     * current buggy in safari https://bugs.webkit.org/show_bug.cgi?id=153588
     * @param videoElement
     * @param canvas
     */
    captureOnCanvas(videoElement: HTMLVideoElement, canvas: HTMLCanvasElement): void {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
    }

    capture(): void {
        if (this._previewContainer) {
            this._previewContainer.addImage(this.getCapturedData());
        }
    }

    download(bangumi_name: string, episode_no: number, currentPlayTime: number): void {
        let url = this.getCapturedData();
        let hiddenAnchor = document.createElement('a');
        let filename = `${bangumi_name}_${episode_no}_${Math.round(currentPlayTime)}.${this.imageFormat}`;
        hiddenAnchor.setAttribute('download', filename);
        hiddenAnchor.setAttribute('href', url.replace(/^data:image\/[^;]]/, 'data:application/octet-stream'));
        let clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: false
        });
        hiddenAnchor.dispatchEvent(clickEvent);
    }

    registerPreviewContainer(container: PreviewContainer) {
        this._previewContainer = container;
    }

    unregisterPreviewContainer() {
        this._previewContainer = null;
    }

    registerVideoElement(videoElement: HTMLVideoElement) {
        this._videoElement = videoElement;
    }

    unregisterVideoElement() {
        this._videoElement = null;
    }

    private getCapturedData(): string {
        let canvas = document.createElement('canvas');
        canvas.width = this._videoElement.videoWidth;
        canvas.height = this._videoElement.videoHeight;
        canvas.getContext('2d').drawImage(this._videoElement, 0, 0);
        return canvas.toDataURL(`image/${this.imageFormat}`);
    }

}
