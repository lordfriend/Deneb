import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, Self } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { VideoPlayerHelpers } from '../../core/helpers';
import { VideoPlayer } from '../../video-player.component';

@Component({
    selector: 'video-player-scrub-bar',
    templateUrl: './scrub-bar.html',
    styleUrls: ['./scrub-bar.less']
})
export class VideoPlayerScrubBar implements AfterViewInit, OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _dragEventEmitSubscription: Subscription;
    private _playProgressRatio = 0;
    private _isDragging = false;
    private _isSeeking = false;

    buffered = 0;

    currentTime = 0;

    duration = Number.NaN;

    notMobileDevice = !VideoPlayerHelpers.isMobileDevice();

    @Output()
    motion = new EventEmitter<any>();

    get playProgressRatio(): number {
        if (this._isDragging || this._isSeeking) {
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
        return Math.round(this.buffered / this.duration * 1000) / 10;
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
        );
        this._subscription.add(
            this._videoPlayer.seeking.subscribe(isSeeking => this._isSeeking = isSeeking)
        )
    }

    ngAfterViewInit(): void {
        let hostElement = this._hostRef.nativeElement;
        this._subscription.add(
            Observable.fromEvent(hostElement, 'mousedown')
                .filter(() => {
                    return !Number.isNaN(this.duration);
                })
                .do((event: MouseEvent) => {
                    event.preventDefault();
                    this._playProgressRatio = Math.round(VideoPlayerHelpers.calcSliderRatio(hostElement, event) * 1000) / 10;
                    this.startDrag();
                })
                .flatMap(() => {
                    return Observable.fromEvent(document, 'mousemove')
                        .takeUntil(Observable.fromEvent(document, 'mouseup')
                            .do((event: MouseEvent) => {
                                this._isSeeking = true;
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
            this.motion.emit(1);
        })
    }

    private stopDrag() {
        this._isDragging = false;
        this._dragEventEmitSubscription.unsubscribe();
    }
}
