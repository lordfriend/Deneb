import { NgModule } from '@angular/core';
import { VideoPlayer } from './video-player.component';
import { VideoControls } from './controls/controls.component';
import { VideoPlayerScrubBar } from './controls/scrub-bar/scrub-bar.component';
import { VideoPlayButton } from './controls/play-button/play-button.component';
import { CommonModule } from '@angular/common';
import { VideoFullscreenButton } from './controls/fullscreen-button/fullscreen-button.component';
import { VideoTimeIndicator } from './controls/time-indicator/time-indicator.component';
import { VideoVolumeControl } from './controls/volume-control/volume-control.component';
import { VideoCapture } from './core/video-capture.service';
import { CapturedFrameList } from './controls/captured-frame-list/captured-frame-list.component';
import { VideoCaptureButton } from './controls/capture-button/capture-button.component';
import { CapturedImageOperationDialog } from './controls/captured-frame-list/operation-dialog/operation-dialog.component';
import { VideoPlayerConfigButton } from './controls/config-button/config-button.component';

@NgModule({
    declarations: [
        VideoPlayer,
        VideoControls,
        VideoPlayerScrubBar,
        VideoPlayButton,
        VideoFullscreenButton,
        VideoTimeIndicator,
        VideoVolumeControl,
        VideoCaptureButton,
        VideoPlayerConfigButton,
        CapturedFrameList,
        CapturedImageOperationDialog
    ],
    providers: [
        VideoCapture
    ],
    imports: [
        CommonModule
    ],
    exports: [
        VideoPlayer
    ],
    entryComponents: [
        VideoControls,
        CapturedImageOperationDialog
    ]
})
export class VideoPlayerModule {

}
