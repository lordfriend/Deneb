import { Component, ElementRef, OnDestroy, OnInit, Self } from '@angular/core';
import { Subscription } from 'rxjs/index';
import { VideoPlayer } from '../../video-player.component';

@Component({
    selector: 'non-interactive-progress-bar',
    templateUrl: 'non-interactive-progress-bar.html',
    styleUrls: ['./non-interactive-progress-bar.less']
})
export class NonInteractiveProgressBarComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    duration = Number.NaN;
    currentTime = 0;
    buffered = 0;

    get playProgressPercentage(): number {
        if (Number.isNaN(this.duration)) {
            return 0;
        }
        return Math.round(this.currentTime / this.duration * 1000) / 10;
    }

    get bufferedPercentage(): number {
        if (Number.isNaN(this.duration)) {
            return 0;
        }
        return Math.round(this.buffered / this.duration * 1000) / 10;
    }

    constructor(@Self() private _hostRef: ElementRef, private _videoPlayer: VideoPlayer) {
    }

    ngOnInit(): void {
        this._subscription.add(
            this._videoPlayer.currentTime.subscribe(time => this.currentTime = time)
        );
        this._subscription.add(
            this._videoPlayer.duration.subscribe(duration => {
                this.duration = duration;
            })
        );
        this._subscription.add(
            this._videoPlayer.buffered.subscribe(buffered => this.buffered = buffered)
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

}
