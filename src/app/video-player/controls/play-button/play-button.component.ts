import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { VideoPlayer } from '../../video-player.component';
import { PlayState } from '../../core/state';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'video-play-button',
    template: `
        <i class="icon" [ngClass]="iconClass"></i>
    `
})
export class VideoPlayButton implements OnInit, OnDestroy{
    private _subscription = new Subscription();

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
        switch (this.state) {
            case PlayState.PAUSED:
            case PlayState.PLAY_END:
                this._videoPlayer.play();
                break;
            case PlayState.PLAYING:
                this._videoPlayer.pause();
                break;
            // no default
        }
    }

    ngOnInit(): void {
        this._subscription.add(
            this._videoPlayer.state
                .subscribe((state) => {
                    this.state = state;
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
