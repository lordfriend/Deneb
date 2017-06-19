import { AfterViewInit, Component, ElementRef, HostBinding, Injector, OnDestroy, OnInit, Self } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { VideoPlayer } from '../video-player.component';
import { PlayState } from '../core/state';

export const CONTROL_FADE_OUT_TIME = 3000;

@Component({
    selector: 'video-controls',
    templateUrl: './controls.html',
    styleUrls: ['./controls.less'],
    animations: [
        trigger('controlBarState', [
            state('in', style({
                transform: 'translateY(0)'
            })),
            state('out', style({
                transform: 'translateY(100%)'
            })),
            transition('in => out', animate('100ms ease-in')),
            transition('out => in', animate('100ms ease-out'))
        ]),
        trigger('reflectState', [
            state('active', style({
                opacity: 1,
                transform: 'scale(2)'
            })),
            state('inactive', style({
                opacity: 0,
                transform: 'scale(1)'
            })),
            transition('inactive => active', animate('500ms ease-in', keyframes([
                style({opacity: 0.8, transform: 'scale(1)', offset: 0}),
                style({opacity: 0.5, transform: 'scale(2)', offset: 0.6}),
                style({opacity: 0, transform: 'scale(2)', offset: 1})
            ]))),
        ])
    ],
    host: {
        '[class.hide-cursor]': '!showControls'
    }
})
export class VideoControls implements OnInit, OnDestroy, AfterViewInit {
    private _subscription = new Subscription();
    private _motion = new Subject();
    private _videoPlayer: VideoPlayer;

    showControls = true;

    pendingPlayState: PlayState;
    reflectState: string = 'inactive';

    get reflectIconClass(): string {
        switch(this.pendingPlayState) {
            case PlayState.PLAYING:
                return 'play';
            case PlayState.PAUSED:
                return 'pause';
            default:
                return 'play';
        }
    }

    get controlBarState(): string {
        return this.showControls ? 'in' : 'out';
    }

    constructor(@Self() private _hostRef: ElementRef, private _injector: Injector) {
    }

    onClickVideo(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.pendingPlayState === PlayState.PLAYING || this.pendingPlayState === PlayState.INVALID) {
            this._videoPlayer.pause();
        } else {
            this._videoPlayer.play();
        }

        this.reflectState = 'active';
    }

    reflectAnimationCallback() {
        this.reflectState = 'inactive';
    }

    onMotion() {
        this._motion.next(1);
    }

    onControlBarClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    ngOnInit(): void {
        this._videoPlayer = this._injector.get(VideoPlayer);
        this._videoPlayer.pendingState
            .merge(this._videoPlayer.state)
            .subscribe((state) => {
                this.pendingPlayState = state;
            });
    }

    ngAfterViewInit(): void {
        let hostElement = this._hostRef.nativeElement;
        this._subscription.add(
            Observable.fromEvent(hostElement, 'mousedown')
                .subscribe((event: MouseEvent) => event.preventDefault())
        );
        this._subscription.add(
            Observable.fromEvent(hostElement, 'mouseenter')
                .subscribe(
                    () => {
                        this.showControls = true;
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(hostElement, 'mouseleave')
                .subscribe(
                    () => {
                        this.showControls = false;
                    }
                )
        );

        this._subscription.add(
            this._motion.asObservable()
                .merge(Observable.fromEvent(hostElement, 'mousemove'))
                .timeout(CONTROL_FADE_OUT_TIME)
                .do(() => {},
                    () => {
                        this.showControls = false;
                    })
                .retry()
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
