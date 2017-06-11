import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { VideoPlayer } from '../../video-player.component';
import { Subscription } from 'rxjs/Subscription';

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
            flex: 0 0 auto;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
            padding: 0.4rem;
            line-height: 1;
            cursor: default;
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
        return VideoTimeIndicator.convertTime(this.duration);
    }

    get currentTimeClock() : string {
        if (Number.isNaN(this.duration)) {
            return '-';
        }
        return VideoTimeIndicator.convertTime(this.currentTime);
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

    static convertTime(timeInSeconds: number): string {
        let hours = Math.floor(timeInSeconds / 3600);
        let minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
        let seconds = Math.floor(timeInSeconds - hours * 3600 - minutes * 60);
        let mm, ss;
        if (minutes < 10) {
            mm = '0' + minutes;
        } else {
            mm = '' + minutes;
        }
        if (seconds < 10) {
            ss = '0' + seconds;
        } else {
            ss = '' + seconds;
        }
        if (hours > 0) {
            return `${hours}:${mm}:${ss}`;
        }
        return `${mm}:${ss}`;
    }
}
