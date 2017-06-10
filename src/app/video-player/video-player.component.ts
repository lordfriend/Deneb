import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    Self, SimpleChanges,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PlayState } from './core/state';
import { FullScreenAPI } from './core/full-screen-api';
import { Subject } from 'rxjs/Subject';
import { VideoFile } from '../entity/video-file';
import { VideoPlayerHelpers } from './core/helpers';

let nextId = 0;

@Component({
    selector: 'video-player',
    templateUrl: './video-player.html',
    styleUrls: ['./video-player.less']
})
export class VideoPlayer implements AfterViewInit, OnDestroy, OnChanges {
    private _subscription = new Subscription();

    private _currentTimeSubject = new BehaviorSubject(0);
    private _durationSubject = new BehaviorSubject(Number.NaN);
    private _state = new BehaviorSubject(PlayState.PAUSED);
    private _buffered = new BehaviorSubject(0);
    private _volume = new BehaviorSubject(1);

    private _motion = new Subject<any>();

    @Input()
    videoFile: VideoFile;

    fullscreenAPI: FullScreenAPI;

    mediaUrl: string;
    mediaType: string;

    playerId = 'videoPlayerId' + (nextId++);

    @ViewChild('media') mediaRef: ElementRef;
    @ViewChild('controlContainer', {read: ViewContainerRef}) controlContainer: ViewContainerRef;

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

    get motion(): Observable<any> {
        return this._motion.asObservable();
    }

    get volume(): Observable<number> {
        return this._volume.asObservable();
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

    constructor(@Self() public videoPlayerRef: ElementRef) {
    }

    pause() {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement) {
            mediaElement.pause();
        }
    }

    play() {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        if (mediaElement) {
            mediaElement.play();
        }
    }

    seek(playProgressRatio) {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        mediaElement.currentTime = Math.round(playProgressRatio * mediaElement.duration);
    }

    onControlMotion() {
        this._motion.next(1);
    }

    ngAfterViewInit(): void {
        let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
        this.fullscreenAPI = new FullScreenAPI(mediaElement, this.videoPlayerRef.nativeElement);
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'durationchange')
                .subscribe(
                    () => {
                        this._durationSubject.next(mediaElement.duration);
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'loadedmetadata')
                .subscribe(
                    () => {
                        // TODO: set seeking position
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'timeupdate')
                .subscribe(
                    () => {
                        this._currentTimeSubject.next(mediaElement.currentTime);
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'progress')
                .subscribe(
                    () => {
                        let end = mediaElement.buffered.length - 1;
                        if (end > 0) {
                            this._buffered.next(mediaElement.buffered.end(end));
                        }
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'play')
                .subscribe(
                    () => {
                        this._state.next(PlayState.PLAYING);
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'pause')
                .subscribe(
                    () => {
                        this._state.next(PlayState.PAUSED)
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(mediaElement, 'eneded')
                .subscribe(
                    () => {
                        this._state.next(PlayState.PLAY_END)
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('videoFile' in changes) {
            this.mediaUrl = this.videoFile.url;
            this.mediaType = 'video/' + VideoPlayerHelpers.getExtname(this.videoFile.url);
            let mediaElement = this.mediaRef.nativeElement as HTMLMediaElement;
            mediaElement.load();
            mediaElement.play();
        }
    }
}
