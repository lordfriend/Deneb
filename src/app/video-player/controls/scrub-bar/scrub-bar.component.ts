import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Self } from '@angular/core';
import { VideoControls } from '../controls.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'video-player-scrub-bar',
    templateUrl: './scrub-bar.html'
})
export class VideoPlayerScrubBar implements AfterViewInit, OnDestroy {
    private _subscription = new Subscription();
    private _dragEventEmitSubscription: Subscription;
    private _playProgressRatio = 0;
    private _isDragging = false;

    @Input()
    buffered = 0;

    @Input()
    currentTime = 0;

    @Input()
    duration = Number.NaN;

    @Output()
    seek = new EventEmitter<number>();

    constructor(private _controls: VideoControls,
                @Self() private _hostRef: ElementRef) {
    }

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

    ngAfterViewInit(): void {
        let hostElement = this._hostRef.nativeElement;
        this._subscription.add(
            Observable.fromEvent(hostElement, 'mousedown')
                .do((event: MouseEvent) => {
                    this._playProgressRatio = Math.round(VideoPlayerScrubBar.calcPlayProgressRatio(hostElement, event) * 1000) / 10;
                    this.startDrag();
                })
                .flatMap(() => {
                    return Observable.fromEvent(document, 'mousemove')
                        .takeUntil(Observable.fromEvent(document, 'mouseup')
                            .do((event: MouseEvent) => {
                                this.seek.emit(VideoPlayerScrubBar.calcPlayProgressRatio(hostElement, event));
                                this.stopDrag();
                            }))
                })
                .subscribe(
                    (event: MouseEvent) => {
                        this._playProgressRatio = Math.round(VideoPlayerScrubBar.calcPlayProgressRatio(hostElement, event) * 1000) / 10;
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
            this._controls.emitMotion(1);
        })
    }

    private stopDrag() {
        this._isDragging = false;
        this._dragEventEmitSubscription.unsubscribe();
    }

    static calcPlayProgressRatio(sliderElement: HTMLElement, event: MouseEvent): number {
        let rect = sliderElement.getBoundingClientRect();
        let offsetX = 0;
        if (event.clientX < rect.left + 1) {
            offsetX = 0;
        } else if (event.clientX > rect.right - 1) {
            offsetX = rect.width;
        } else {
            offsetX = event.clientX - (rect.left + 1);
        }
        return offsetX / (rect.width - 2);
    }
}
