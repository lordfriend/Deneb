import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    HostBinding,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Self,
    SimpleChanges,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { UIDialog } from 'deneb-ui';
import {
    BehaviorSubject,
    fromEvent as observableFromEvent,
    interval as observableInterval,
    Observable,
    Subject,
    Subscription,
    merge
} from 'rxjs';

import { filter, map, timeout } from 'rxjs/operators';
import { Bangumi, Episode } from '../entity';
import { VideoFile } from '../entity/video-file';
import { VideoControls } from './controls/controls.component';
import { FullScreenAPI } from './core/full-screen-api';
import { VideoPlayerHelpers } from './core/helpers';
import { VideoPlayerShortcuts } from './core/shortcuts';
import { PlayState, ReadyState } from './core/state';
import { VideoCapture } from './core/video-capture.service';
import { FloatControlsComponent } from './float-controls/float-controls.component';
import { VideoPlayerHelpDialog } from './help-dialog/help-dialog.component';
import { VideoTouchControls } from './touch-controls/touch-controls.component';

let nextId = 0;

export const MAX_TOLERATE_WAITING_TIME = 10000;
export const INITIAL_TOLERATE_WAITING_TIME = 5000;

export const MIN_FLOAT_PLAYER_HEIGHT = 180;
export const MIN_FLOAT_PLAYER_WIDTH = 320;

@Component({
    selector: 'video-player',
    templateUrl: './video-player.html',
    styleUrls: ['./video-player.less'],
    host: {
        'tabindex': '0'
    }
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
    private _seeking = new Subject<boolean>();

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

    @Input()
    nextEpisodeId: string;

    @Input()
    nextEpisodeName: string;

    @Input()
    nextEpisodeNameCN: string;

    @Input()
    nextEpisodeThumbnail: string;

    @Output()
    onProgress = new EventEmitter<number>();

    @Output()
    onDurationUpdate = new EventEmitter<number>();

    @Output()
    lagged = new EventEmitter<boolean>();

    /**
     * emit next episode id
     * @type {EventEmitter<string>}
     */
    @Output()
    onPlayNextEpisode = new EventEmitter<string>();

    fullscreenAPI: FullScreenAPI;
    shortcuts: VideoPlayerShortcuts;

    @HostBinding('class.fullscreen')
    isFullscreen: boolean;

    @HostBinding('class.float-play')
    isFloatPlay: boolean;

    mediaUrl: string;
    mediaType: string;

    playerId = 'videoPlayerId' + (nextId++);

    @ViewChild('media') mediaRef: ElementRef;
    @ViewChild('overlay', {read: ViewContainerRef}) controlContainer: ViewContainerRef;

    /**
     * measured dimension according current viewport size
     */
    playerMeasuredWidth: number;
    playerMeasuredHeight: number;

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

    constructor(@Self() public videoPlayerRef: ElementRef,
                private _changeDetector: ChangeDetectorRef,
                private _videoCapture: VideoCapture,
                private _injector: Injector,
                private _componentFactoryResolver: ComponentFactoryResolver,
                private _dialogService: UIDialog) {
    }

    setPendingState(state: number): void {
        this._pendingStateSubject.next(state);
        this._pendingState = state;
    }

    setVolume(vol: number): void {
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

    volumeUp(delta: number): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        let currentVolume = mediaElement.volume;
        if (mediaElement) {
            if (currentVolume + delta > 1) {
                this.setVolume(1);
            } else {
                this.setVolume(currentVolume + delta);
            }
        }
    }

    volumeDown(delta: number): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        let currentVolume = mediaElement.volume;
        if (mediaElement) {
            if (currentVolume - delta < 0) {
                this.setVolume(0);
            } else {
                this.setVolume(currentVolume - delta);
            }
        }
    }

    toggleMuted(): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement) {
            this.setMuted(!mediaElement.muted);
        }
    }

    /**
     * pause the playback of current video. By checking the network state is HAVE_FUTURE_DATA,
     * the player will make a actual call of pause operation or set a pending state to PlayState.PAUSED.
     * This may help to release the sockets holding by Chrome.
     */
    pause(): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement && mediaElement.readyState >= ReadyState.HAVE_FUTURE_DATA) {
            mediaElement.pause();
        } else {
            this.setPendingState(PlayState.PAUSED);
        }
    }

    play(): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        let rst: Promise<void>;
        if (this._stateSubject.getValue() === PlayState.INITIAL) {
            mediaElement.load();
        }
        if (mediaElement && mediaElement.readyState >= ReadyState.HAVE_FUTURE_DATA) {
            // TODO: We could add some handler for playback start and error situations.
            rst = mediaElement.play();
            rst.then(() => {
                console.log('play start');
            }, (reason) => {
                console.log(reason);
            })
        } else {
            this.setPendingState(PlayState.PLAYING);
        }
    }

    togglePlayAndPause(): void {
        if (Number.isNaN(this._durationSubject.getValue())) {
            return;
        }
        if (this._pendingState === PlayState.PLAYING || this._stateSubject.getValue() === PlayState.PLAYING) {
            this.pause();
        } else {
            this.play();
        }
    }

    seek(playProgressRatio): void {
        const mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        // ended state must be retrieved before set currentTime.
        let isPlayBackEnded = mediaElement.ended;
        let newTime = Math.round(playProgressRatio * mediaElement.duration);
        // set currentTimeSubject manually.
        this._currentTimeSubject.next(newTime);
        mediaElement.currentTime = newTime;
        if (isPlayBackEnded) {
            this.play();
        }
    }

    fastForward(time: number): void {
        if (Number.isNaN(this._durationSubject.getValue())) {
            return;
        }
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        let currentTime = mediaElement.currentTime;
        let duration = mediaElement.duration;
        if (currentTime + time > duration) {
            this.seek(1);
        } else {
            this.seek((currentTime + time) / duration);
        }
    }

    fastBackward(time: number): void {
        if (Number.isNaN(this._durationSubject.getValue())) {
            return;
        }
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        let currentTime = mediaElement.currentTime;
        let duration = mediaElement.duration;
        if (currentTime - time < 0) {
            this.seek(0);
        } else {
            this.seek((currentTime - time) / duration);
        }
    }

    toggleFullscreen(): void {
        this.fullscreenAPI.toggleFullscreen();
    }

    toggleFloatPlay(): void {
        this.isFloatPlay = !this.isFloatPlay;
        const hostElement = this.videoPlayerRef.nativeElement as HTMLElement;
        this.togglePlayerDimension(hostElement);
        this.controlContainer.remove(0);
        if (this.isFloatPlay) {
            const factory = this._componentFactoryResolver.resolveComponentFactory(FloatControlsComponent);
            const componentRef = factory.create(this._injector);
            componentRef.instance.videoTitle = `${this.bangumiName} ${this.episodeNo}`;
            this.controlContainer.insert(componentRef.hostView);
        } else {
            if (VideoPlayerHelpers.isMobileDevice()) {
                this.controlContainer.createComponent(this._componentFactoryResolver.resolveComponentFactory(VideoTouchControls));
            } else {
                this.controlContainer.createComponent(this._componentFactoryResolver.resolveComponentFactory(VideoControls));
            }
        }
    }

    requestFocus(): void {
        let hostElement = this.videoPlayerRef.nativeElement as HTMLElement;
        hostElement.focus();
    }

    openHelpDialog(): void {
        let dialogRef;

        if (this.fullscreenAPI.isFullscreen) {
            dialogRef = this._dialogService.open(VideoPlayerHelpDialog, {
                stickyDialog: false,
                backdrop: true
            }, this.controlContainer);
        } else {
            dialogRef = this._dialogService.open(VideoPlayerHelpDialog, {stickyDialog: false, backdrop: true});
        }
        this._subscription.add(
            dialogRef.afterClosed()
                .subscribe(() => {
                    this.requestFocus();
                })
        );
    }

    playNextEpisode(): void {
        this.onPlayNextEpisode.emit(this.nextEpisodeId);
    }

    /**
     * Invoked by VideoPlayerService
     */
    setData(episode: Episode, bangumi: Bangumi, nextEpisode: Episode, videoFile: VideoFile, startPosition: number): void {
        let lastVideoFileId;
        if (this.videoFile) {
            lastVideoFileId = this.videoFile.id;
        }

        this.bangumiName = bangumi.name_cn || bangumi.name;
        this.episodeNo = episode.episode_no;
        this.nextEpisodeId = nextEpisode.id;
        this.nextEpisodeName = nextEpisode.name;
        this.nextEpisodeNameCN = nextEpisode.name_cn;
        this.videoFile = videoFile;
        this.startPosition = startPosition;
        if (lastVideoFileId !== videoFile.id) {
            this._resetPlayer();
        }
        this._initiatePlayer();
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
        let hostElement = this.videoPlayerRef.nativeElement as HTMLElement;

        this._videoCapture.registerVideoElement(mediaElement as HTMLVideoElement);

        // init fullscreen API
        this.fullscreenAPI = new FullScreenAPI(mediaElement, hostElement);
        this.fullscreenAPI.onChangeFullscreen.subscribe(isFullscreen => {
            this.isFullscreen = isFullscreen;
            if (this.videoFile && this.videoFile.resolution_w && this.videoFile.resolution_h) {
                this.togglePlayerDimension(hostElement);
            }
        });

        // init shortcuts
        this.shortcuts = new VideoPlayerShortcuts(hostElement, this, this._videoCapture);

        this._subscription.add(
            merge(
                observableFromEvent(window, 'resize'),
                this.fullscreenAPI.onChangeFullscreen)
            .pipe(
                filter(() => {
                    return Boolean(this.videoFile && this.videoFile.resolution_w && this.videoFile.resolution_h);
                }),)
                .subscribe(() => {
                    this.togglePlayerDimension(hostElement);
                })
        );

        this.togglePlayerDimension(hostElement);

        this._subscription.add(
            observableFromEvent(mediaElement, 'durationchange')
                .subscribe(() => {
                    let duration = mediaElement.duration;
                    this._durationSubject.next(duration);
                    this.onDurationUpdate.emit(duration);
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'loadedmetadata')
                .subscribe(() => {
                    if (this.startPosition) {
                        mediaElement.currentTime = this.startPosition;
                    }

                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'timeupdate')
                .subscribe(() => {
                    let currentTime = mediaElement.currentTime;
                    this._currentTimeSubject.next(currentTime);
                    this.onProgress.next(currentTime);
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'progress')
                .subscribe(() => {
                    let end = mediaElement.buffered.length - 1;
                    if (end >= 0) {
                        this._buffered.next(mediaElement.buffered.end(end));
                    }
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'play')
                .subscribe(() => {
                    this._stateSubject.next(PlayState.PLAYING);
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'pause')
                .subscribe(() => {
                    this._stateSubject.next(PlayState.PAUSED);
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'ended')
                .subscribe(
                    () => {
                        this._stateSubject.next(PlayState.PLAY_END);
                    }
                )
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'seeking')
                .subscribe(() => {
                    this._seeking.next(true);
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'seeked')
                .subscribe(() => {
                    this._seeking.next(false);
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'volumechange')
                .subscribe(() => {
                    this._volume.next(mediaElement.volume);
                    this._muted.next(mediaElement.muted);
                })
        );
        this._subscription.add(
            observableFromEvent(mediaElement, 'canplay')
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

        // focus this element
        this.requestFocus();
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._videoCapture.unregisterVideoElement();
        this.shortcuts.destroy();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('videoFile' in changes) {
            this._initiatePlayer();
        }
    }

    private _initiatePlayer(): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        this.makeMediaUrl();
        mediaElement.load();
        this.play();
    }

    private _resetPlayer(): void {
        this._currentTimeSubject.next(0);
        this._durationSubject.next(NaN);
        this._stateSubject.next(PlayState.INITIAL);
        this._pendingStateSubject.next(PlayState.INVALID);
        this._buffered.next(0);
    }

    private makeMediaUrl(): void {
        this.mediaUrl = `${this.videoFile.url}`;
        this.mediaType = 'video/' + VideoPlayerHelpers.getExtname(this.videoFile.url);
        this._changeDetector.detectChanges();
    }

    private watchForWaiting(): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        this._waitingSubscription.unsubscribe();
        this._waitingSubscription = observableInterval(100).pipe(
            map(() => {
                return mediaElement.readyState < ReadyState.HAVE_FUTURE_DATA;
            }),
            filter(waiting => !waiting),
            timeout(this._tolerateWaitingTime),)
            .subscribe(() => {
            }, () => {
                this.lagged.emit(true);
                if (this._tolerateWaitingTime < MAX_TOLERATE_WAITING_TIME) {
                    this._tolerateWaitingTime += 500;
                }
            });
    }

    /**
     * measure the required size base on viewport size and video resolution.
     * The applied size may not necessarily the same
     * @returns {{width: number; height: number}}
     */
    private measurePlayerSize(): {width: number, height: number} {
        let viewportWidth = document.documentElement.clientWidth;
        let viewportHeight = document.documentElement.clientHeight;
        let videoWidth = this.videoFile.resolution_w;
        let videoHeight = this.videoFile.resolution_h;
        // space below the video
        const preserveHeight = 129;
        const navbarHeight = 50;
        // y + 109 <= viewportHeight
        // x <= viewportWidth
        // x / y = videoWidth / videoHeight
        let playerWidth, playerHeight;
        let theaterHeight = viewportHeight - navbarHeight - preserveHeight;
        let theaterSpaceRatio = viewportWidth / theaterHeight;
        let videoRatio = videoWidth / videoHeight;
        if (theaterSpaceRatio > videoRatio) {
            playerHeight = theaterHeight;
            playerWidth = videoRatio * playerHeight;
        } else {
            playerWidth = viewportWidth;
            playerHeight = playerWidth / videoRatio;
        }
        return {width: playerWidth, height: playerHeight};
    }

    private togglePlayerDimension(hostElement: HTMLElement): void {
        let {width, height} = this.measurePlayerSize();
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        // for those portrait screen like most mobile devices, we don't apply a PIP style float play
        if (this.isFloatPlay && viewportWidth > 0.8 * viewportHeight) {

            if (viewportWidth / viewportHeight > width / height) {
                // We want the float player be 1/3 of the measured width, but not less than the minimal.
                this.playerMeasuredWidth = Math.max(MIN_FLOAT_PLAYER_WIDTH, width * 0.4);
                this.playerMeasuredHeight = height / width * this.playerMeasuredWidth;
            } else {
                // We want the float player be 1/3 of the measured height, but not less than the minimal.
                this.playerMeasuredHeight = Math.max(MIN_FLOAT_PLAYER_HEIGHT, height * 0.4);
                this.playerMeasuredWidth = width / height * this.playerMeasuredHeight;
            }

        } else {
            this.playerMeasuredWidth = width;
            this.playerMeasuredHeight = height;
        }
        if (!this.isFullscreen && !!this.playerMeasuredWidth && !!this.playerMeasuredHeight) {
            hostElement.style.width = `${this.playerMeasuredWidth}px`;
            hostElement.style.height = `${this.playerMeasuredHeight}px`;
        } else {
            hostElement.style.removeProperty('width');
            hostElement.style.removeProperty('height');
        }
    }
}
