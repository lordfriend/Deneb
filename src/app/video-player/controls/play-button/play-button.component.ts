import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, merge } from 'rxjs/operators';
import { PlayState } from '../../core/state';
import { VideoPlayer } from '../../video-player.component';

@Component({
    selector: 'video-play-button',
    template: `
        <i class="icon" [ngClass]="iconClass"></i>
    `,
    styles: [`
        :host {
            display: inline-block;
            box-sizing: border-box;
            flex: 0 0 auto;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
            padding: 0.4rem;
            cursor: pointer;
            line-height: 1;
        }
    `]
})
export class VideoPlayButton implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    controlVisibleState: boolean;

    state: PlayState;

    get iconClass() : 'pause' | 'play' | 'repeat' {
        switch (this.state) {
            case PlayState.PLAYING:
                return 'pause';
            case PlayState.PAUSED:
                return 'play';
            case PlayState.PLAY_END:
                return 'repeat';
            default:
                return 'play';
        }
    }

    constructor(private _videoPlayer: VideoPlayer) {
    }

    @HostListener('click', ['$event'])
    onClick (event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (!this.controlVisibleState) {
            return;
        }
        switch (this.state) {
            case PlayState.PAUSED:
            case PlayState.PLAY_END:
                this._videoPlayer.play();
                break;
            case PlayState.PLAYING:
                this._videoPlayer.pause();
                break;
            default:
                this._videoPlayer.play();
        }
    }

    ngOnInit(): void {
        this._subscription.add(
            this._videoPlayer.pendingState.pipe(
                filter(state => state !== PlayState.INVALID),
                merge(this._videoPlayer.state),)
                .subscribe((state) => {
                    this.state = state;
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
