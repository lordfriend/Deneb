import { Component, Input } from '@angular/core';

@Component({
    selector: 'video-time-indicator',
    template: `
        <div class="time-indicator">
            <span class="current-time">{{currentTimeClock}}</span>
            <span class="duration">{{durationClock}}</span>
        </div>
    `
})
export class VideoTimeIndicator {

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

    @Input()
    currentTime = Number.NaN;

    @Input()
    duration = Number.NaN;

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
