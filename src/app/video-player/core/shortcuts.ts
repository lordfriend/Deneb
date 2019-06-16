
import {fromEvent as observableFromEvent,  Subscription ,  Observable } from 'rxjs';

import {map, tap, filter} from 'rxjs/operators';
import { VideoPlayer } from '../video-player.component';
import { VideoCapture } from './video-capture.service';

export const KEY_MAP = {
    ENTER: 13,
    SPACE: 32,
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    C: 67,
    M: 77,
    EQUAL_SIGN: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191
};

export const FAST_SEEK_TIME = 5; // unit is second
export const VOLUME_DELTA = 0.1;

export class VideoPlayerShortcuts {
    private _subscription = new Subscription();
    currentTime: number;
    focus = false;

    constructor(private _hostElement: Element, videoPlayer: VideoPlayer, captureService: VideoCapture) {
        this._subscription.add(
            videoPlayer.currentTime.subscribe(t => this.currentTime = t)
        );
        this._subscription.add(
            observableFromEvent(_hostElement, 'focus')
                .subscribe(() => {
                    this.focus = true
                })
        );
        this._subscription.add(
            observableFromEvent(_hostElement, 'blur')
                .subscribe(() => {
                    this.focus = false
                })
        );
        this._subscription.add(
            observableFromEvent(_hostElement, 'keydown').pipe(
                filter(() => this.focus),
                filter((event: KeyboardEvent) => {
                    return Object.keys(KEY_MAP)
                        .map(name => KEY_MAP[name])
                        .some(code => event.which === code)
                }),)
                .subscribe((event: KeyboardEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                })
        );
        this._subscription.add(
            observableFromEvent(_hostElement, 'keyup').pipe(
                filter(() => this.focus),
                filter((event: KeyboardEvent) => {
                    return Object.keys(KEY_MAP)
                        .map(name => KEY_MAP[name])
                        .some(code => event.which === code)
                }),
                tap((event: KeyboardEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                }),
                map((event: KeyboardEvent) => {
                    return event.which;
                }),)
                .subscribe((code: number) => {
                    switch (code) {
                        case KEY_MAP.ENTER:
                            videoPlayer.toggleFullscreen();
                            break;
                        case KEY_MAP.SPACE:
                            videoPlayer.togglePlayAndPause();
                            break;
                        case KEY_MAP.COMMA:
                        case KEY_MAP.LEFT_ARROW:
                            videoPlayer.fastBackward(FAST_SEEK_TIME);
                            break;
                        case KEY_MAP.PERIOD:
                        case KEY_MAP.RIGHT_ARROW:
                            videoPlayer.fastForward(FAST_SEEK_TIME);
                            break;
                        case KEY_MAP.EQUAL_SIGN:
                            videoPlayer.volumeUp(VOLUME_DELTA);
                            break;
                        case KEY_MAP.DASH:
                            videoPlayer.volumeDown(VOLUME_DELTA);
                            break;
                        case KEY_MAP.M:
                            videoPlayer.toggleMuted();
                            break;
                        case KEY_MAP.C:
                            captureService.capture(videoPlayer.bangumiName, videoPlayer.episodeNo, this.currentTime);
                            break;
                        case KEY_MAP.FORWARD_SLASH:
                            videoPlayer.openHelpDialog();
                            break;
                        // no default
                    }
                })
        );
    }

    destroy() {
        this._subscription.unsubscribe();
    }
}
