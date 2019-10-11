import { Component, OnDestroy, OnInit } from '@angular/core';
import { VideoPlayer } from '../../video-player.component';
import { Subscription } from 'rxjs';
import { VideoPlayerHelpers } from '../../core/helpers';

@Component({
    selector: 'video-time-indicator',
    template: `
        <span class="current-time">{{currentTimeClock}}</span>
        <span class="separator">&#47;</span>
        <span class="duration">{{durationClock}}</span>
    `,
    styles: [`
        :host {
            display: inline-block;
            box-sizing: border-box;
            flex: 0 0 auto;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
            padding: 0.4rem;
            line-height: 1;
            cursor: default;
            font-family: "Segoe UI", sans-serif;
        }
    `]
})
export class VideoTimeIndicator implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    currentTime = Number.NaN;
    duration = Number.NaN;

    get durationClock(): string {
        if (Number.isNaN(this.duration)) {
            return '-';
        }
        return VideoPlayerHelpers.convertTime(this.duration);
    }

    get currentTimeClock() : string {
        if (Number.isNaN(this.duration)) {
            return '-';
        }
        return VideoPlayerHelpers.convertTime(this.currentTime);
    }

    constructor(private _videoPlayer: VideoPlayer) {
    }

    ngOnInit(): void {
        this._subscription.add(
            this._videoPlayer.currentTime.subscribe(time => this.currentTime = time)
        );
        this._subscription.add(
            this._videoPlayer.duration.subscribe(duration => this.duration = duration)
        )
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

}
