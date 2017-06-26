import { AfterViewInit, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { VideoPlayerHelpers } from '../core/helpers';
import { VideoPlayer } from '../video-player.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'video-touch-controls',
    templateUrl: './touch-controls.html',
    styleUrls: ['./touch-controls.less']
})
export class VideoTouchControls implements OnInit, OnDestroy, AfterViewInit {
    private _subscription = new Subscription();
    private _videoPlayer: VideoPlayer;

    showControls: boolean;

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

    onMotion() {

    }

    constructor(private _injector: Injector) {
    }

    ngOnInit(): void {
        this._videoPlayer = this._injector.get(VideoPlayer);
        this._subscription.add(
            this._videoPlayer.currentTime.subscribe(time => this.currentTime = time)
        );
        this._subscription.add(
            this._videoPlayer.duration.subscribe(duration => this.duration = duration)
        )
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
