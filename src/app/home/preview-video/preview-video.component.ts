
import {map} from 'rxjs/operators';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VideoFile } from '../../entity/video-file';
import { VideoPlayer } from '../../video-player/video-player.component';
import { Http } from '@angular/http';
import { animate, transition, trigger, state, style } from '@angular/animations';

export interface PVManifest {
    name: string,
    name_cn?: string,
    bgm_id?: number,
    image?: string,
    summary?: string,
    air_date?: string,
    timestamp: string;
}

@Component({
    selector: 'preview-video',
    templateUrl: './preview-video.html',
    styleUrls: ['./preview-video.less'],
    animations: [
        trigger('timing', [
            state('active', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            state('leave', style({
                transform: 'translateX(-50%)',
                opacity: 0
            })),
            state('enter', style({
                transform: 'translateX(50%)',
                opacity: 0
            })),
            transition('enter => active', animate('150ms linear')),
            transition('active => leave', animate('150ms linear'))
        ])
    ]
})
export class PreviewVideoComponent implements OnInit, OnDestroy {
    videoFile: VideoFile;
    manifest: PVManifest[];
    currentTime: number;

    currentPV: PVManifest;

    currentPVState = 'enter';

    @ViewChild(VideoPlayer) videoPlayer: VideoPlayer;

    constructor(private _http: Http) {
    }

    focusVideoPlayer(event: Event) {
        let target = event.target as HTMLElement;
        if (target.classList.contains('theater-backdrop')) {
            this.videoPlayer.requestFocus();
        }
    }

    onProgressUpdate(currentTime: number) {
        this.currentTime = currentTime;
        if (!!this.currentPV && this.currentPVState === 'active') {
            let [startTime, endTime] = this.parseTimestamp(this.currentPV.timestamp);
            if (currentTime < startTime || currentTime > endTime) {
                this.currentPVState = 'leave';
                return;
            }
        }
        if (!!this.manifest && this.manifest.length > 0) {
            let activatedPV = this.manifest.find((pv) => {
                let [st, et] = this.parseTimestamp(pv.timestamp);
                return st <= currentTime && et >= currentTime;
            });
            if (!!activatedPV) {
                this.currentPV = activatedPV;
                this.currentPVState = 'active';
            } else {
                this.currentPVState = 'enter';
            }
        }
    }

    ngOnInit(): void {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        const videoPath = params.get('p');
        let staticDomain = params.get('d');
        if (!staticDomain) {
            staticDomain = window.location.host;
        }
        this.videoFile = {
            url: `//${staticDomain}/video/preview-video/${videoPath}.mp4`
        };

        let videoPathDir = videoPath.substring(0, videoPath.indexOf('/'));

        this._http.get(`//${staticDomain}/video/preview-video/${videoPathDir}/manifest.json`).pipe(
            map(res => res.json() as PVManifest[]))
            .subscribe((mainfest: PVManifest[]) => {
                this.manifest = mainfest;
                this.currentPV = this.manifest[0];
            });
    }

    ngOnDestroy(): void {
    }

    private parseTimestamp(timestamp): number[] {
        let match = timestamp.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        let startTimeMatch = match[1].match(/(\d{2}):(\d{2})/);
        let endTimeMatch = match[2].match(/(\d{2}):(\d{2})/);
        let startTimeBySec = parseInt(startTimeMatch[1]) * 60 + parseInt(startTimeMatch[2]);
        let endTimeBySec = parseInt(endTimeMatch[1]) * 60 + parseInt(endTimeMatch[2]);
        return [startTimeBySec, endTimeBySec];
    }

}
