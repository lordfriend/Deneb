import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { VideoPlayer } from '../../video-player.component';
import { PlayState } from '../../core/state';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'video-play-button',
    template: `
        <i class="icon" [ngClass]="iconClass"></i>
    `
})
export class VideoPlayButton implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    state: PlayState;

    iconClass: 'pause' | 'play' | 'repeat';

    constructor(private _videoPlayer: VideoPlayer) {
    }

    @HostListener('click', ['$event'])
    onClick (event: Event) {
        event.stopPropagation();
        event.preventDefault();
        switch (this.state) {
            case PlayState.PLAY_END:
            case PlayState.PAUSED:
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
            this._videoPlayer.state.subscribe(
                (state) => {
                    this.state = state;
                    switch (state) {
                        case PlayState.PLAYING:
                            this.iconClass = 'pause';
                            break;
                        case PlayState.PAUSED:
                            this.iconClass = 'play';
                            break;
                        case PlayState.PLAY_END:
                            this.iconClass = 'repeat';
                            break;
                    }
                }
            )
        )
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
