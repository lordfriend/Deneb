import {
    AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output,
    ViewChild
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { VideoPlayerHelpers } from '../../core/helpers';
import { VideoPlayer } from '../../video-player.component';

@Component({
    selector: 'video-volume-control',
    templateUrl: './volume-control.html',
    styleUrls: ['./volume-control.less']
})
export class VideoVolumeControl implements AfterViewInit, OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _dragEventEmitSubscription: Subscription;
    private _isDragging = false;

    volume: number;

    volumeLevelClass: string;

    @Output()
    motion = new EventEmitter<any>();

    @ViewChild('slider') slider: ElementRef;

    constructor(private _videoPlayer: VideoPlayer) {
    }

    ngOnInit(): void {
        this._subscription.add(
            this._videoPlayer.volume.subscribe(vol => this.volume = vol)
        );
    }

    ngAfterViewInit(): void {
        let sliderElement = this.slider.nativeElement;
        this._subscription.add(
            Observable.fromEvent(sliderElement, 'mousedown')
                .do((event: MouseEvent) => {
                    this._videoPlayer.setVolume(VideoPlayerHelpers.calcSliderRatio(sliderElement, event));
                    this.startDrag();
                })
                .flatMap(() => {
                    return Observable.fromEvent(document, 'mousemove')
                        .takeUntil(Observable.fromEvent(document, 'mouseup')
                            .do(() => {
                                this.stopDrag();
                            }));
                })
                .subscribe((event: MouseEvent) => {
                    this._videoPlayer.setVolume(VideoPlayerHelpers.calcSliderRatio(sliderElement, event));
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private startDrag() {
        this._isDragging = true;
        this._dragEventEmitSubscription = Observable.interval(100).subscribe(() => {
            this.motion.emit(1);
        })
    }

    private stopDrag() {
        this._isDragging = false;
        this._dragEventEmitSubscription.unsubscribe();
    }
}
