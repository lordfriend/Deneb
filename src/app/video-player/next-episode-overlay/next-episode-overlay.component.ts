
import {interval as observableInterval,  Subscription ,  Observable } from 'rxjs';

import {take} from 'rxjs/operators';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { VideoPlayer } from '../video-player.component';

export const countDownTimer = 8; // unit second

@Component({
    selector: 'next-episode-overlay',
    templateUrl: './next-episode-overlay.html',
    styleUrls: ['./next-episode-overlay.less']
})
export class VideoNextEpisodeOverlay implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    countdownRadius  = 2.5;
    circumference = 2 * 2.5 * Math.PI;
    progress = 0.2 * this.circumference;

    nextEpisodeId: string;
    nextEpisodeName: string;
    nextEpisodeNameCN: string;
    nextEpisodeThumbnail: string;

    @Input()
    hasNextEpisode: boolean;

    @Output()
    onCancel = new EventEmitter<any>();

    constructor(private _videoPlayer: VideoPlayer) {
    }

    onClickNextButton(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._videoPlayer.playNextEpisode();
    }

    onClickCancelButton(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.onCancel.emit(1);
    }

    @HostListener('click', ['$event'])
    onClickHost(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    ngOnInit(): void {
        this.nextEpisodeId = this._videoPlayer.nextEpisodeId;
        this.nextEpisodeName = this._videoPlayer.nextEpisodeName;
        this.nextEpisodeNameCN = this._videoPlayer.nextEpisodeNameCN;
        this.nextEpisodeThumbnail = this._videoPlayer.nextEpisodeThumbnail;

        this._subscription.add(
            observableInterval(50).pipe(
                take(countDownTimer * 20))
                .subscribe((t) => {
                    this.progress = - ((t + 1) / (countDownTimer * 20)) * this.circumference;
                }, () => {
                    // do nothing
                }, () => {
                    this._videoPlayer.playNextEpisode();
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

}
