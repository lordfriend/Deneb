import {
    AfterViewInit, ChangeDetectorRef,
    Component, ComponentFactoryResolver,
    ElementRef, EventEmitter, HostBinding, Injector,
    Input,
    OnChanges,
    OnDestroy, OnInit, Output,
    Self,
    SimpleChanges,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReadyState, PlayState } from './core/state';
import { FullScreenAPI } from './core/full-screen-api';
import { VideoFile } from '../entity/video-file';
import { VideoPlayerHelpers } from './core/helpers';
import { VideoControls } from './controls/controls.component';
import { VideoCapture } from './core/video-capture.service';
import { VideoTouchControls } from './touch-controls/touch-controls.component';

let nextId = 0;

export const MAX_TOLERATE_WAITING_TIME = 10000;
export const INITIAL_TOLERATE_WAITING_TIME = 5000;

@Component({
    selector: 'video-player',
    templateUrl: './video-player.html',
    styleUrls: ['./video-player.less']
})
export class VideoPlayer implements AfterViewInit, OnInit, OnDestroy, OnChanges {
    private _subscription = new Subscription();
    private _waitingSubscription = new Subscription();

    private _currentTimeSubject = new BehaviorSubject(0);
    private _durationSubject = new BehaviorSubject(Number.NaN);
    private _stateSubject = new BehaviorSubject(PlayState.INITIAL);
    private _pendingStateSubject = new BehaviorSubject(PlayState.INVALID);
    private _buffered = new BehaviorSubject(0);
    private _volume = new BehaviorSubject(1);
    private _muted = new BehaviorSubject(false);
    private _seeking = new BehaviorSubject(false);

    private _pendingState = PlayState.INVALID;

    /**
     * use for reload video when waiting time exceed this threshold value,
     * each time a waiting occur, this time will plus 500ms until it reaches MAX_TOLERATE_WAITING_TIME
     * @type {number}
     * @private
     */
    private _tolerateWaitingTime = INITIAL_TOLERATE_WAITING_TIME;

    @Input()
    videoFile: VideoFile;

    /**
     * the position which video should play from.
     * @type {number}
     */
    @Input()
    startPosition = 0;

    @Input()
    thumbnail: string;

    /**
     * can be Bangumi#name or Bangumi#name_cn
     */
    @Input()
    bangumiName: string;

    @Input()
    episodeNo: number;

    @Output()
    onProgress = new EventEmitter<number>();

    @Output()
    onDurationUpdate = new EventEmitter<number>();

    @Output()
    lagged = new EventEmitter<boolean>();

    fullscreenAPI: FullScreenAPI;

    @HostBinding('class.fullscreen')
    isFullscreen: boolean;

    mediaUrl: string;
    mediaType: string;

    playerId = 'videoPlayerId' + (nextId++);

    @ViewChild('media') mediaRef: ElementRef;
    @ViewChild('overlay', {read: ViewContainerRef}) controlContainer: ViewContainerRef;

    /**
     * currentTime of media element.
     * @returns {Observable<number>} current time in seconds
     */
    get currentTime(): Observable<number> {
        return this._currentTimeSubject.asObservable();
    }

    /**
     * duration of media element
     * @returns {Observable<number>} duration in seconds
     */
    get duration(): Observable<number> {
        return this._durationSubject.asObservable();
    }

    /**
     * media element play state
     * @returns {Observable<PlayState>}
     */
    get state(): Observable<PlayState> {
        return this._stateSubject.asObservable();
    }

    get pendingState(): Observable<PlayState> {
        return this._pendingStateSubject.asObservable();
    }

    get buffered(): Observable<number> {
        return this._buffered.asObservable();
    }

    get volume(): Observable<number> {
        return this._volume.asObservable();
    }

    get muted(): Observable<boolean> {
        return this._muted.asObservable();
    }

    get seeking(): Observable<boolean> {
        return this._seeking.asObservable();
    }

    get showLoader(): boolean {
        if (this.mediaRef) {
            let mediaElement = this.mediaRef.nativeElement;
            return (mediaElement.readyState < ReadyState.HAVE_FUTURE_DATA) && !mediaElement.paused;
        } else {
            return false;
        }
    }

    setPendingState(state: number) {
        this._pendingStateSubject.next(state);
        this._pendingState = state;
    }

    setVolume(vol: number) {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement && vol >= 0 && vol <= 1) {
            mediaElement.volume = vol;
        }
    }

    setMuted(muted: boolean) {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement) {
            mediaElement.muted = muted;
        }
    }

    constructor(@Self() public videoPlayerRef: ElementRef,
                private _changeDetector: ChangeDetectorRef,
                private _videoCapture: VideoCapture,
                private _injector: Injector,
                private _componentFactoryResolver: ComponentFactoryResolver) {
    }

    /**
     * pause the playback of current video. By checking the network state is HAVE_ENOUGH_DATA,
     * the player will make a actual call of pause operation or set a pending state to PlayState.PAUSED.
     * This may help to release the sockets holding by Chrome.
     */
    pause() {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement && mediaElement.readyState >= ReadyState.HAVE_ENOUGH_DATA) {
            mediaElement.pause();
        } else {
            this.setPendingState(PlayState.PAUSED);
        }
    }

    play() {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (this._stateSubject.getValue() === PlayState.INITIAL) {
            mediaElement.load();
        }
        if (mediaElement && mediaElement.readyState >= ReadyState.HAVE_ENOUGH_DATA) {
            mediaElement.play();
        } else {
            this.setPendingState(PlayState.PLAYING);
        }
    }

    seek(playProgressRatio) {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        // ended state must be retrieved before set currentTime.
        let isPlayBackEnded = mediaElement.ended;
        mediaElement.currentTime = Math.round(playProgressRatio * mediaElement.duration);
        if (isPlayBackEnded) {
            this.play();
        }
    }

    toggleFullscreen() {
        this.fullscreenAPI.toggleFullscreen();
    }

    ngOnInit(): void {
        let controlsComponentFactory, componentRef;
        if (VideoPlayerHelpers.isMobileDevice()) {
           // TODO: for mobile device, should init a touch controls
            controlsComponentFactory = this._componentFactoryResolver.resolveComponentFactory(VideoTouchControls);
        } else {
            controlsComponentFactory = this._componentFactoryResolver.resolveComponentFactory(VideoControls);
        }
        componentRef = controlsComponentFactory.create(this._injector);
        this.controlContainer.insert(componentRef.hostView);
    }

    ngAfterViewInit(): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;

        this._videoCapture.registerVideoElement(mediaElement as HTMLVideoElement);

        // init fullscreen API
        this.fullscreenAPI = new FullScreenAPI(mediaElement, this.videoPlayerRef.nativeElement);
        this.fullscreenAPI.onChangeFullscreen.subscribe(isFullscreen => this.isFullscreen = isFullscreen);

        this._subscription.add(
            Observable.fromEvent(mediaElement, 'durationchange')
                .subscribe(() => {
                    let duration = mediaElement.duration;
                    this._durationSubject.next(duration);
                    this.onDurationUpdate.emit(duration);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'loadedmetadata')
                .subscribe(() => {
                    if (this.startPosition) {
                        mediaElement.currentTime = this.startPosition;
                    }

                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'timeupdate')
                .subscribe(() => {
                    let currentTime = mediaElement.currentTime;
                    this._currentTimeSubject.next(currentTime);
                    this.onProgress.next(currentTime);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'progress')
                .subscribe(() => {
                    let end = mediaElement.buffered.length - 1;
                    if (end >= 0) {
                        this._buffered.next(mediaElement.buffered.end(end));
                    }
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'play')
                .subscribe(() => {
                    this._stateSubject.next(PlayState.PLAYING);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'pause')
                .subscribe(() => {
                    this._stateSubject.next(PlayState.PAUSED);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'ended')
                .subscribe(
                    () => {
                        this._stateSubject.next(PlayState.PLAY_END);
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'seeking')
                .subscribe(() => {
                    this._seeking.next(true);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'seeked')
                .subscribe(() => {
                    this._seeking.next(false);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'volumechange')
                .subscribe(() => {
                    this._volume.next(mediaElement.volume);
                    this._muted.next(mediaElement.muted);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'canplaythrough')
                .subscribe(() => {
                    this.lagged.emit(false);
                    this.watchForWaiting();
                    if (this._pendingState !== PlayState.INVALID) {
                        switch (this._pendingState) {
                            case PlayState.PLAYING:
                                mediaElement.play();
                                this.setPendingState(PlayState.INVALID);
                                break;
                            case PlayState.PAUSED:
                                mediaElement.pause();
                                this.setPendingState(PlayState.INVALID);
                                break;
                            // no default
                        }
                    }
                })
        );

    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._videoCapture.unregisterVideoElement();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('videoFile' in changes) {
            let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
            this.makeMediaUrl();
            mediaElement.load();
            this.play();
        }
    }

    private makeMediaUrl() {
        this.mediaUrl = `${this.videoFile.url}?c=${Date.now()}`;
        this.mediaType = 'video/' + VideoPlayerHelpers.getExtname(this.videoFile.url);
        this._changeDetector.detectChanges();
    }

    private watchForWaiting() {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        this._waitingSubscription.unsubscribe();
        this._waitingSubscription = Observable.interval(100)
            .map(() => {
                return mediaElement.readyState < ReadyState.HAVE_FUTURE_DATA;
            })
            .filter(waiting => !waiting)
            .timeout(this._tolerateWaitingTime)
            .subscribe(() => {}, () => {
                this.lagged.emit(true);
                if (this._tolerateWaitingTime < MAX_TOLERATE_WAITING_TIME) {
                    this._tolerateWaitingTime += 500;
                }
            });
    }
}
