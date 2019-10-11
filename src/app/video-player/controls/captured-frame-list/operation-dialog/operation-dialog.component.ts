import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IMAGE_PROPERTY_NAME } from '../../../core/video-capture.service';
import { UIDialogRef } from 'deneb-ui';
import { PersistStorage } from '../../../../user-service';
import { Capture } from '../../../core/settings';
import download from 'downloadjs';

export const RESULT_TWITTER = 'twitter';
export const RESULT_DOWNLOAD = 'download';
export const RESULT_TRASH = 'trash';

@Component({
    selector: 'captured-image-operation-dialog',
    templateUrl: './operation-dialog.html',
    styleUrls: ['./operation-dialog.less']
})
export class CapturedImageOperationDialog implements AfterViewInit {
    private _autoRemove: boolean;

    image: HTMLImageElement;

    set autoRemove(v: boolean) {
        this._autoRemove = v;
        this._persistStorage.setItem(Capture.AUTO_REMOVE, v + '');
    }

    get autoRemove(): boolean {
        return this._autoRemove;
    }

    @ViewChild('imageWrapper', {static: false}) imageWrapper: ElementRef;

    constructor(private _dialogRef: UIDialogRef<CapturedImageOperationDialog>,
                private _persistStorage: PersistStorage) {
        let savedAutoRemove = this._persistStorage.getItem(Capture.AUTO_REMOVE, 'true');
        this._autoRemove = savedAutoRemove === 'true';
    }

    shareToTwitter(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._dialogRef.close({result: RESULT_TWITTER, remove: this.autoRemove});
    }

    download(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        let dataURI = this.image.src;
        let {bangumi_name, episode_no, currentPlayTime} = this.image[IMAGE_PROPERTY_NAME];
        let filename = `${bangumi_name}_${episode_no}_${Math.round(currentPlayTime)}.png`;
        download(dataURI, filename, 'application/octet-stream');
        this._dialogRef.close({result: RESULT_DOWNLOAD, remove: this.autoRemove});
    }

    trash(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._dialogRef.close({result: RESULT_TRASH, remove: true});
    }

    ngAfterViewInit(): void {
        let imageWrapperElement = this.imageWrapper.nativeElement as HTMLElement;
        imageWrapperElement.appendChild(this.image);
    }
}
