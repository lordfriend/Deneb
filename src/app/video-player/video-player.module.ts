import { NgModule } from '@angular/core';
import { VideoPlayer } from './video-player.component';
import { VideoControls } from './controls/controls.component';
import { VideoPlayerScrubBar } from './controls/scrub-bar/scrub-bar.component';
import { VideoPlayButton } from './controls/play-button/play-button.component';
import { CommonModule } from '@angular/common';
import { VideoFullscreenButton } from './controls/fullscreen-button/fullscreen-button.component';
import { VideoTimeIndicator } from './controls/time-indicator/time-indicator.component';
import { VideoVolumeControl } from './controls/volume-control/volume-control.component';

@NgModule({
    declarations: [
        VideoPlayer,
        VideoControls,
        VideoPlayerScrubBar,
        VideoPlayButton,
        VideoFullscreenButton,
        VideoTimeIndicator,
        VideoVolumeControl
    ],
    imports: [
        CommonModule
    ],
    exports: [
        VideoPlayer
    ],
    entryComponents: [
        VideoControls
    ]
})
export class VideoPlayerModule {

}
