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
import { UIToggleModule } from 'deneb-ui';
import { FormsModule } from '@angular/forms';
import { VideoTouchControls } from './touch-controls/touch-controls.component';
import { VideoPlayerHelpDialog } from './help-dialog/help-dialog.component';
import { VideoPlayerHelpButton } from "./controls/help-button/help-button.component";
import { VideoNextEpisodeOverlay } from './next-episode-overlay/next-episode-overlay.component';
import { VideoConfigPanelComponent } from './controls/config-button/config-panel/config-panel.component';

@NgModule({
    declarations: [
        VideoPlayer,
        VideoControls,
        VideoTouchControls,
        VideoPlayerScrubBar,
        VideoPlayButton,
        VideoFullscreenButton,
        VideoTimeIndicator,
        VideoVolumeControl,
        VideoCaptureButton,
        CapturedFrameList,
        CapturedImageOperationDialog,
        VideoPlayerConfigButton,
        VideoPlayerHelpDialog,
        VideoPlayerHelpButton,
        VideoNextEpisodeOverlay,
        VideoConfigPanelComponent
    ],
    providers: [
        VideoCapture
    ],
    imports: [
        CommonModule,
        UIToggleModule,
        FormsModule
    ],
    exports: [
        VideoPlayer
    ],
    entryComponents: [
        VideoControls,
        VideoTouchControls,
        CapturedImageOperationDialog,
        VideoPlayerHelpDialog,
        VideoPlayerHelpButton,
        VideoConfigPanelComponent
    ]
})
export class VideoPlayerModule {

}
