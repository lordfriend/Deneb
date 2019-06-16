import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import {
    AfterViewInit,
    Component,
    ElementRef,
    Injector,
    OnDestroy,
    OnInit,
    Self,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { fromEvent as observableFromEvent, Subject, Subscription } from 'rxjs';

import { filter, merge, retry, tap, timeout } from 'rxjs/operators';
import { PersistStorage } from '../../user-service/persist-storage';
import { CONTROL_FADE_OUT_TIME } from '../core/helpers';
import { PlayList } from "../core/settings";
import { PlayState } from '../core/state';
import { VideoPlayer } from '../video-player.component';

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
    private _preventHide = false;

    showControls = true;

    pendingPlayState: PlayState;
    reflectState: string = 'inactive';

    isPlayEnd: boolean;
    hasNextEpisode: boolean;

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

    @ViewChild('controlWrapper', {read: ViewContainerRef}) controlWrapper: ViewContainerRef;

    constructor(@Self() private _hostRef: ElementRef,
                private _injector: Injector,
                private _persistStorage: PersistStorage) {
    }

    onClickVideo(event: Event) {
        event.preventDefault();
        // event.stopPropagation();
        this._videoPlayer.requestFocus();
        this._videoPlayer.togglePlayAndPause();
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

    onCancelNext() {
        this.hasNextEpisode = false;
    }

    keepShow(keep: boolean) {
        this._preventHide = keep;
        this.showControls = keep;
    }

    ngOnInit(): void {
        this._videoPlayer = this._injector.get(VideoPlayer);
        this._videoPlayer.pendingState.pipe(
            merge(this._videoPlayer.state))
            .subscribe((state) => {
                this.pendingPlayState = state;
                if (state === PlayState.PLAY_END) {
                    let autoPlayNext = this._persistStorage.getItem(PlayList.AUTO_PLAY_NEXT, 'true') === 'true';
                    this.hasNextEpisode = !!this._videoPlayer.nextEpisodeId && autoPlayNext;
                    this.isPlayEnd = true;
                } else {
                    this.isPlayEnd = false;
                }
            });
    }

    ngAfterViewInit(): void {
        let hostElement = this._hostRef.nativeElement;
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
            this._motion.asObservable().pipe(
                merge(observableFromEvent(hostElement, 'mousemove')),
                timeout(CONTROL_FADE_OUT_TIME),
                tap(() => {},
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
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
