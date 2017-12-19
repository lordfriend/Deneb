import { Component, OnDestroy, OnInit } from '@angular/core';
import { VideoFile } from '../../entity/video-file';

@Component({
    selector: 'preview-video',
    templateUrl: './preview-video.html',
    styleUrls: ['./preview-video.less']
})
export class PreviewVideoComponent implements OnInit, OnDestroy {
    videoFile: VideoFile;

    ngOnInit(): void {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        const videoFileName = params.get('v');
        let staticDomain = params.get('d');
        if (!staticDomain) {
            staticDomain = window.location.host;
        }
        this.videoFile = {
            url: `//${staticDomain}/video/preview-video/${videoFileName}.mp4`
        };
    }

    ngOnDestroy(): void {
    }

}
