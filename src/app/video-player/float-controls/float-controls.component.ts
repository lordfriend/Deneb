import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    AfterViewInit,
    Component,
    ElementRef, HostBinding,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Self,
    ViewChild
} from '@angular/core';
import { fromEvent as observableFromEvent, merge, Subject, Subscription } from 'rxjs';
import { filter, retry, tap, timeout } from 'rxjs/operators';
import { CONTROL_FADE_OUT_TIME, VideoPlayerHelpers } from '../core/helpers';
import { VideoPlayer } from '../video-player.component';
import { VideoPlayerService } from '../video-player.service';

@Component({
    selector: 'video-player-float-controls',
    templateUrl: './float-controls.html',
    styleUrls: ['./float-controls.less'],
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
export class FloatControlsComponent implements OnInit, AfterViewInit, OnDestroy {
    private _subscription = new Subscription();
    private _motion = new Subject();
    private _videoPlayer: VideoPlayer;
    private _fadeOutTime = CONTROL_FADE_OUT_TIME + 1000;
    private _preventHide = false;

    showControls = true;

    currentTime = Number.NaN;
    duration = Number.NaN;

    @Input()
    videoTitle: string;

    isPortrait: boolean;

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

    constructor(private _injector: Injector,
                @Self() private _hostElementRef: ElementRef) {
    }

    onMotion() {
        this._motion.next(1);
    }

    close(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        const videoPlayerService = this._injector.get(VideoPlayerService);
        videoPlayerService.closeFloatPlayer();
    }

    leaveFloat(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        const videoPlayerService = this._injector.get(VideoPlayerService);
        videoPlayerService.leaveFloatPlay(true, false);
    }

    ngOnInit(): void {
        this._videoPlayer = this._injector.get(VideoPlayer);
        this._subscription.add(
            this._videoPlayer.currentTime.subscribe(time => this.currentTime = time)
        );
        this._subscription.add(
            this._videoPlayer.duration.subscribe(duration => this.duration = duration)
        );
        this.isPortrait = VideoPlayerHelpers.isPortrait();
    }

    ngAfterViewInit(): void {
        const hostElement = this._hostElementRef.nativeElement;
        this._subscription.add(
            observableFromEvent(hostElement, 'mousedown')
                .subscribe((event: MouseEvent) => event.preventDefault())
        );
        this._subscription.add(
            observableFromEvent(hostElement, 'mouseenter').pipe(
                filter(() => !this._preventHide))
                .subscribe(
                    () => {
                        this.showControls = true;
                    }
                )
        );
        this._subscription.add(
            observableFromEvent(hostElement, 'mouseleave').pipe(
                filter(() => !this._preventHide))
                .subscribe(
                    () => {
                        this.showControls = false;
                    }
                )
        );

        this._subscription.add(
            merge(
                this._motion.asObservable(),
                observableFromEvent(hostElement, 'mousemove'))
                .pipe(
                    timeout(CONTROL_FADE_OUT_TIME),
                    tap(() => {
                        },
                        () => {
                            if (!this._preventHide) {
                                this.showControls = false;
                            }
                        }),
                    retry(),)
                .subscribe(
                    () => {
                        this.showControls = true;
                    }
                )
        );
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
    }
}
