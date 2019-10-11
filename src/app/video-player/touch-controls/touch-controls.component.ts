
import {retry, tap, timeout} from 'rxjs/operators';
import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, Self, ViewChild} from '@angular/core';
import { CONTROL_FADE_OUT_TIME, VideoPlayerHelpers } from '../core/helpers';
import { VideoPlayer } from '../video-player.component';
import { Subscription ,  Subject } from 'rxjs';
import * as Hammer from 'hammerjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {closest} from "../../../helpers/dom";

@Component({
    selector: 'video-touch-controls',
    templateUrl: './touch-controls.html',
    styleUrls: ['./touch-controls.less'],
    animations: [
        trigger('controlState', [
            state('show', style({
                opacity: 1
            })),
            state('hide', style({
                opacity: 0
            })),
            transition('show => hide', animate('200ms ease-out')),
            transition('hide => show', animate('200ms ease-in'))
        ])
    ]
})
export class VideoTouchControls implements OnInit, OnDestroy, AfterViewInit {
    private _subscription = new Subscription();
    private _motion = new Subject();
    private _videoPlayer: VideoPlayer;
    private _tapHandlerBinding = this.tapHandler.bind(this);
    private _hammerManager: HammerManager;
    private _fadeOutTime = CONTROL_FADE_OUT_TIME + 1000;

    showControls = true;

    currentTime = Number.NaN;
    duration = Number.NaN;

    get durationClock(): string {
        if (Number.isNaN(this.duration)) {
            return '-';
        }
        return VideoPlayerHelpers.convertTime(this.duration);
    }

    get currentTimeClock() : string {
        if (Number.isNaN(this.duration)) {
            return '-';
        }
        return VideoPlayerHelpers.convertTime(this.currentTime);
    }

    get controlState(): string {
        return this.showControls ? 'show' : 'hide';
    }

    onMotion() {
        this._motion.next(1);
    }

    constructor(private _injector: Injector, @Self() private _hostRef: ElementRef) {
    }

    ngOnInit(): void {
        this._videoPlayer = this._injector.get(VideoPlayer);
        this._subscription.add(
            this._videoPlayer.currentTime.subscribe(time => this.currentTime = time)
        );
        this._subscription.add(
            this._videoPlayer.duration.subscribe(duration => this.duration = duration)
        );
    }

    ngAfterViewInit(): void {
        let hostElement = this._hostRef.nativeElement;
        this._hammerManager = new Hammer.Manager(hostElement, {
            recognizers: [
                [Hammer.Tap]
            ]
        });
        this._hammerManager.on('tap', this._tapHandlerBinding);

        this._subscription.add(
            this._motion.asObservable().pipe(
                timeout(this._fadeOutTime),
                tap(() => {},
                    () => {
                        this.showControls = false;
                    }),
                retry(),)
                .subscribe(
                    () => {
                        this.showControls = true;
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._hammerManager.off('tap', this._tapHandlerBinding);
    }

    private tapHandler(event: HammerInput) {
        let targetEl = event.target;
        if (this.showControls && !targetEl.classList.contains('interact-element') && !closest(targetEl, '.interact-element')) {
            this.showControls = false;
        } else {
            this.onMotion();
            this.showControls = true;
        }
    }
}
