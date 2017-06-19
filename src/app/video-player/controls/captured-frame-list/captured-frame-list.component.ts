import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PreviewContainer, VideoCapture, PreviewImageParams, IMAGE_PROPERTY_NAME } from '../../core/video-capture.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { UIDialog } from 'deneb-ui';
import { CapturedImageOperationDialog } from './operation-dialog/operation-dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'video-captured-frame-list',
    templateUrl: './captured-frame-list.html',
    styleUrls: ['./captured-frame-list.less'],
    animations: [
        trigger('showState', [
            state('in', style({
                transform: 'translateY(0)'
            })),
            state('out', style({
                transform: 'translateY(-100%)'
            })),
            transition('out => in', animate('100ms ease-in')),
            transition('in => out', animate('100ms ease-out'))
        ])
    ]
})
export class CapturedFrameList implements OnInit, AfterViewInit, OnDestroy, PreviewContainer {
    private _subscription = new Subscription();
    private _imageCount = 0;

    @Input()
    showControls: boolean;

    @HostBinding('@showState')
    get showState(): string {
        return this.showControls && this._imageCount > 0 ? 'in' : 'out';
    }

    @ViewChild('wrapper') previewWrapper: ElementRef;

    constructor(private _videoCapture: VideoCapture,
                private _dialogService: UIDialog) {
    }

    addImage(dataURI: string, params: PreviewImageParams) {
        let previewWrapperElement = this.previewWrapper.nativeElement as HTMLElement;
        let image = new Image();
        image.src = dataURI;
        image.style.display = 'inline-block';
        image.style.width = 'auto';
        image.style.height = '100%';
        image.style.cursor = 'pointer';
        image.style.marginLeft = '0.3rem';
        image.style.marginRight = '0.3rem';
        image[IMAGE_PROPERTY_NAME] = params;
        previewWrapperElement.appendChild(image);
        this._imageCount++;
    }

    ngOnInit(): void {
        this._videoCapture.registerPreviewContainer(this);
    }

    ngAfterViewInit(): void {
        let previewWrapperElement = this.previewWrapper.nativeElement as HTMLElement;
        this._subscription.add(
            Observable.fromEvent(previewWrapperElement, 'click')
                .map((event: Event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    return event.target as HTMLElement;
                })
                .filter(element => element.tagName.toUpperCase() === 'IMG')
                .flatMap(image => {
                    let nextSibling = image.nextSibling;
                    let dialogRef = this._dialogService.open(CapturedImageOperationDialog, {
                        stickyDialog: false,
                        backdrop: true
                    });

                    dialogRef.componentInstance.image = image as HTMLImageElement;
                    return dialogRef.afterClosed()
                        .do((result: any) => {
                            if (!result || !result.remove) {
                                previewWrapperElement.insertBefore(image, nextSibling);
                            }
                        })
                })
                .subscribe((result) => {
                    if (result && result.remove) {
                        this._imageCount--;
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._videoCapture.unregisterPreviewContainer();
    }

}
