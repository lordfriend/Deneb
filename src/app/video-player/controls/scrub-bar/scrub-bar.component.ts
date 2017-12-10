import {
    AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, OnInit,
    Output, Self,
    ViewChild
} from '@angular/core';
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
    private _dragProgressRatio = -1;
    private _isDragging = false;
    private _isSeeking = false;
    private _controlVisibleState = false;

    buffered = 0;

    currentTime = 0;

    duration = Number.NaN;

    @HostBinding('class.not-mobile-device')
    notMobileDevice = !VideoPlayerHelpers.isMobileDevice();

    @Input()
    set showControls(s: boolean) {
        this._controlVisibleState = s;
        if (!s) {
            this.pointOpacity = 0;
        }
    }

    get controlVisibleState(): boolean {
        return this._controlVisibleState;
    }

    @Output()
    motion = new EventEmitter<any>();

    pointPosition: string;
    pointTransform: string;
    pointOpacity: number;

    @ViewChild('tip') tipRef: ElementRef;

    get playProgressPercentage(): number {
        if (this._isDragging) {
            return Math.round(this._dragProgressRatio * 1000) / 10;
        } else if (Number.isNaN(this.duration)) {
            return 0;
        }
        return Math.round(this.currentTime / this.duration * 1000) / 10;
    }

    get bufferedPercentage(): number {
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
            this._videoPlayer.duration.subscribe(duration => {
                this._dragProgressRatio = -1;
                this.duration = duration;
            })
        );
        this._subscription.add(
            this._videoPlayer.buffered.subscribe(buffered => this.buffered = buffered)
        );
        this._subscription.add(
            this._videoPlayer.seeking.subscribe(isSeeking => this._isSeeking = isSeeking)
        );
    }

    ngAfterViewInit(): void {
        let hostElement = this._hostRef.nativeElement as HTMLElement;
        let tipElement = this.tipRef.nativeElement as HTMLElement;
        if (this.notMobileDevice) {
            this._subscription.add(
                Observable.fromEvent(hostElement, 'mousedown')
                    .filter(() => {
                        return !Number.isNaN(this.duration);
                    })
                    .map((event: MouseEvent) => {
                        return {rect: hostElement.getBoundingClientRect(), event: event};
                    })
                    .do(({rect, event}: { rect: ClientRect, event: MouseEvent }) => {
                        event.preventDefault();
                        this._dragProgressRatio = VideoPlayerHelpers.calcSliderRatio(rect, event.clientX);
                        this.startDrag();
                        this.updateTip(rect, event, tipElement);
                        this.pointOpacity = 1;
                    })
                    .flatMap(() => {
                        return Observable.fromEvent(document, 'mousemove')
                            .map((event: MouseEvent) => {
                                return {rect: hostElement.getBoundingClientRect(), event: event};
                            })
                            .takeUntil(Observable.fromEvent(document, 'mouseup')
                                .map((event: MouseEvent) => {
                                    return {rect: hostElement.getBoundingClientRect(), event: event};
                                })
                                .do(({rect, event}: { rect: ClientRect, event: MouseEvent }) => {
                                    this._videoPlayer.seek(VideoPlayerHelpers.calcSliderRatio(rect, event.clientX));
                                    this.stopDrag();
                                    if (!this.isEventInRect(rect, event)) {
                                        this.pointOpacity = 0;
                                    }
                                }));
                    })
                    .subscribe(
                        ({rect, event}: { rect: ClientRect, event: MouseEvent }) => {
                            this._dragProgressRatio = VideoPlayerHelpers.calcSliderRatio(rect, event.clientX);
                            this.updateTip(rect, event, tipElement);
                        }
                    )
            );

            this._subscription.add(
                Observable.fromEvent(hostElement, 'mousemove')
                    .filter(() => !Number.isNaN(this.duration))
                    .filter(() => !this._isDragging)
                    .map((event: MouseEvent) => {
                        return {rect: hostElement.getBoundingClientRect(), event: event};
                    })
                    .filter(({rect, event}: { rect: ClientRect, event: MouseEvent }) => {
                        return this.isEventInRect(rect, event);
                    })
                    .subscribe(({rect, event}: { rect: ClientRect, event: MouseEvent }) => {
                        this.updateTip(rect, event, tipElement);
                    })
            );
            this._subscription.add(
                Observable.fromEvent(hostElement, 'mouseenter')
                    .filter(() => !this._isDragging)
                    .map((event: MouseEvent) => {
                        return {rect: hostElement.getBoundingClientRect(), event: event};
                    })
                    .subscribe(({rect, event}: { rect: ClientRect, event: MouseEvent }) => {
                        this.updateTip(rect, event, tipElement);
                        this.pointOpacity = 1;
                    })
            );
            this._subscription.add(
                Observable.fromEvent(hostElement, 'mouseleave')
                    .filter(() => !this._isDragging)
                    .subscribe(() => {
                        this.pointOpacity = 0;
                    })
            );
        } else {
            this._subscription.add(
                Observable.fromEvent(hostElement, 'touchstart')
                    .filter(() => {
                        return this.controlVisibleState;
                    })
                    .filter(() => {
                        return !Number.isNaN(this.duration);
                    })
                    .map((event: TouchEvent) => {
                        return {rect: hostElement.getBoundingClientRect(), event: event};
                    })
                    .do(({rect, event}: { rect: ClientRect, event: TouchEvent }) => {
                        event.preventDefault();
                        this._dragProgressRatio = VideoPlayerHelpers.calcSliderRatio(rect, event.changedTouches[0].clientX);
                        this.startDrag();
                    })
                    .flatMap(() => {
                        return Observable.fromEvent(document, 'touchmove')
                            .map((event: TouchEvent) => {
                                return {rect: hostElement.getBoundingClientRect(), event: event};
                            })
                            .takeUntil(Observable.fromEvent(document, 'touchend')
                                .map((event: TouchEvent) => {
                                    return {rect: hostElement.getBoundingClientRect(), event: event};
                                })
                                .do(({rect, event}: { rect: ClientRect, event: TouchEvent }) => {
                                    this._videoPlayer.seek(VideoPlayerHelpers.calcSliderRatio(rect, event.changedTouches[0].clientX));
                                    this.stopDrag();
                                }));
                    })
                    .subscribe(({rect, event}: { rect: ClientRect, event: TouchEvent }) => {
                        this._dragProgressRatio = VideoPlayerHelpers.calcSliderRatio(rect, event.changedTouches[0].clientX);
                    })
            );
        }

        this._subscription.add(
            Observable.interval(100)
                .filter(() => {
                    return this._isDragging || this._isSeeking;
                })
                .subscribe(() => {
                    this.motion.emit(1);
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private startDrag() {
        this._isDragging = true;
    }

    private stopDrag() {
        this._isDragging = false;
    }

    /**
     * update tip position and content.
     * @param rect - the hostElement
     * @param event
     * @param tipElement
     */
    private updateTip(rect: ClientRect, event: MouseEvent, tipElement: HTMLElement) {
        let rectOfTip = tipElement.getBoundingClientRect();
        let halfWidthOfTip = rectOfTip.width / 2;
        let ratio = VideoPlayerHelpers.calcSliderRatio(rect, event.clientX);
        let pointX = ratio * rect.width - halfWidthOfTip;

        if (pointX < 0) {
            pointX = 0;
        } else if (pointX + rectOfTip.width > rect.width) {
            pointX = rect.width - rectOfTip.width;
        }

        if (pointX === 0) {
            this.pointTransform = `translateX(${-halfWidthOfTip})`;
        } else {
            this.pointTransform = `translateX(${pointX}px)`;
        }
        this.pointPosition = VideoPlayerHelpers.convertTime(this.duration * ratio);
    }

    private isEventInRect(rect: ClientRect, event: MouseEvent): boolean {
        let clientX = event.clientX;
        let clientY = event.clientY;
        return rect.right >= clientX && rect.left <= clientX
            && rect.top <= clientY && rect.bottom >= clientY;
    }
}
