import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Self } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { VideoPlayerHelpers } from '../../core/helpers';
import { VideoPlayer } from '../../video-player.component';

@Component({
    selector: 'video-player-scrub-bar',
    templateUrl: './scrub-bar.html'
})
export class VideoPlayerScrubBar implements AfterViewInit, OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _dragEventEmitSubscription: Subscription;
    private _playProgressRatio = 0;
    private _isDragging = false;

    buffered = 0;

    currentTime = 0;

    duration = Number.NaN;

    get playProgressRatio(): number {
        if (this._isDragging) {
            return this._playProgressRatio;
        } else if (Number.isNaN(this.duration)) {
            return 0;
        }
        return Math.round(this.currentTime / this.duration * 1000) / 10;
    }

    get bufferedRatio(): number {
        if (Number.isNaN(this.duration)) {
            return 0;
        }
        return this.buffered / this.duration;
    }

    constructor(@Self() private _hostRef: ElementRef, private _videoPlayer: VideoPlayer) {
    }

    ngOnInit(): void {
        this._subscription.add(
            this._videoPlayer.currentTime.subscribe(time => this.currentTime = time)
        );
        this._subscription.add(
            this._videoPlayer.duration.subscribe(duration => this.duration = duration)
        );
        this._subscription.add(
            this._videoPlayer.buffered.subscribe(buffered => this.buffered = buffered)
        )
    }

    ngAfterViewInit(): void {
        let hostElement = this._hostRef.nativeElement;
        this._subscription.add(
            Observable.fromEvent(hostElement, 'mousedown')
                .do((event: MouseEvent) => {
                    this._playProgressRatio = Math.round(VideoPlayerHelpers.calcSliderRatio(hostElement, event) * 1000) / 10;
                    this.startDrag();
                })
                .flatMap(() => {
                    return Observable.fromEvent(document, 'mousemove')
                        .takeUntil(Observable.fromEvent(document, 'mouseup')
                            .do((event: MouseEvent) => {
                                this._videoPlayer.seek(VideoPlayerHelpers.calcSliderRatio(hostElement, event));
                                this.stopDrag();
                            }))
                })
                .subscribe(
                    (event: MouseEvent) => {
                        this._playProgressRatio = Math.round(VideoPlayerHelpers.calcSliderRatio(hostElement, event) * 1000) / 10;
                    }
                )
        )
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private startDrag() {
        this._isDragging = true;
        this._dragEventEmitSubscription = Observable.interval(100).subscribe(() => {
            this._videoPlayer.onControlMotion();
        })
    }

    private stopDrag() {
        this._isDragging = false;
        this._dragEventEmitSubscription.unsubscribe();
    }
}
