import {
    AfterViewInit,
    Component, ComponentFactoryResolver,
    ElementRef, HostBinding, Injector,
    Input,
    OnChanges,
    OnDestroy, OnInit,
    Self,
    SimpleChanges,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NetworkState, PlayState } from './core/state';
import { FullScreenAPI } from './core/full-screen-api';
import { VideoFile } from '../entity/video-file';
import { VideoPlayerHelpers } from './core/helpers';
import { VideoControls } from './controls/controls.component';
import { VideoCapture } from './core/video-capture.service';

let nextId = 0;

@Component({
    selector: 'video-player',
    templateUrl: './video-player.html',
    styleUrls: ['./video-player.less']
})
export class VideoPlayer implements AfterViewInit, OnInit, OnDestroy, OnChanges {
    private _subscription = new Subscription();

    private _currentTimeSubject = new BehaviorSubject(0);
    private _durationSubject = new BehaviorSubject(Number.NaN);
    private _state = new BehaviorSubject(PlayState.PAUSED);
    private _buffered = new BehaviorSubject(0);
    private _volume = new BehaviorSubject(1);
    private _muted = new BehaviorSubject(false);
    private _seeking = new BehaviorSubject(false);

    private _pendingState = null;

    @Input()
    videoFile: VideoFile;

    fullscreenAPI: FullScreenAPI;

    @HostBinding('class.fullscreen')
    isFullscreen: boolean;

    mediaUrl: string;
    mediaType: string;

    playerId = 'videoPlayerId' + (nextId++);

    @ViewChild('media') mediaRef: ElementRef;
    @ViewChild('media', {read: ViewContainerRef}) controlContainer: ViewContainerRef;

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
        return this._state.asObservable();
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
        if (mediaElement && mediaElement.networkState >= NetworkState.HAVE_ENOUGH_DATA) {
            mediaElement.pause();
        } else {
            this._pendingState = PlayState.PAUSED;
        }
    }

    play() {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement && mediaElement.networkState >= NetworkState.HAVE_ENOUGH_DATA) {
            mediaElement.play();
        } else {
            this._pendingState = PlayState.PLAYING;
        }
    }

    seek(playProgressRatio) {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        mediaElement.currentTime = Math.round(playProgressRatio * mediaElement.duration);
    }

    toggleFullscreen() {
        this.fullscreenAPI.toggleFullscreen();
    }

    ngOnInit(): void {
        // if (VideoPlayerHelpers.isMobileDevice()) {
        //    TODO: for mobile device, should init a touch controls
        // } else {

        // }
        let controlsComponentFactory = this._componentFactoryResolver.resolveComponentFactory(VideoControls);
        let componentRef = controlsComponentFactory.create(this._injector);
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
                    this._durationSubject.next(mediaElement.duration);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'loadedmetadata')
                .subscribe(() => {
                    // TODO: set seeking position
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'timeupdate')
                .subscribe(() => {
                    this._currentTimeSubject.next(mediaElement.currentTime);
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
                    this._state.next(PlayState.PLAYING);
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'pause')
                .subscribe(() => {
                    this._state.next(PlayState.PAUSED)
                })
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'ended')
                .subscribe(
                    () => {
                        this._state.next(PlayState.PLAY_END)
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
                    if (this._pendingState) {
                        switch (this._pendingState) {
                            case PlayState.PLAYING:
                                mediaElement.play();
                                break;
                            case PlayState.PAUSED:
                                mediaElement.pause();
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
            this.mediaUrl = this.videoFile.url;
            this.mediaType = 'video/' + VideoPlayerHelpers.getExtname(this.videoFile.url);
            let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
            mediaElement.load();
            this._pendingState = PlayState.PLAYING;
        }
    }
}
