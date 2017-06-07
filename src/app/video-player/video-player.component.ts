import { AfterViewInit, Component, ElementRef, OnDestroy, Self, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PlayState } from './core/state';
import { FullScreenAPI } from './core/full-screen-api';

@Component({
    selector: 'video-player',
    templateUrl: './video-player.html'
})
export class VideoPlayer implements AfterViewInit, OnDestroy{
    private _subscription = new Subscription();

    private _currentTimeSubject = new BehaviorSubject(0);
    private _durationSubject = new BehaviorSubject(Number.NaN);
    private _state = new BehaviorSubject(PlayState.PAUSED);
    private _buffered = new BehaviorSubject(0);

    fullscreenAPI: FullScreenAPI;

    mediaUrl: string;
    mediaType: string;

    @ViewChild('media') mediaRef: ElementRef;

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
}
