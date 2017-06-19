import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { VideoCapture } from '../../core/video-capture.service';
import { VideoPlayer } from '../../video-player.component';
import { Subscription } from 'rxjs/Subscription';
import { PersistStorage } from '../../../user-service/persist-storage';
import { Capture } from '../../core/settings';

@Component({
    selector: 'video-capture-button',
    template: '<i class="camera retro icon"></i>',
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
export class VideoCaptureButton implements OnInit, OnDestroy{
    private _subscription = new Subscription();

    private _currentTime: number = 0;

    constructor(private _videoCapture: VideoCapture,
                private _videoPlayer: VideoPlayer,
                private _persistStorage: PersistStorage) {
    }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        let bangumi_name = 'test';
        let episode_no = 1;
        if (this.getConfigDirectDownload()) {
            this._videoCapture.download(bangumi_name, episode_no, this._currentTime);
            return;
        }
        this._videoCapture.capture(bangumi_name, episode_no, this._currentTime);
    }

    ngOnInit(): void {
        this._subscription.add(
            this._videoPlayer.currentTime
                .subscribe(time => this._currentTime = time)
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private getConfigDirectDownload() {
        let savedDirectDownload = this._persistStorage.getItem(Capture.DIRECT_DOWNLOAD, 'false');
        return savedDirectDownload === 'true';
    }
}
