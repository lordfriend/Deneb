import {NgModule} from '@angular/core';
import {Player} from './player.component';
import {PlayerControls} from './player-controls/player-controls.component';
import {TimePipe} from './pipe/time.pipe';
import {VideoCaptureService} from './video-capture/video-capture.service';
import {VolumeControl} from './volumne-control/volume-control.component';
import {BrowserModule} from '@angular/platform-browser';
import {Ng2SemanticModule} from '../../../ng2-semantic';

@NgModule({
  declarations: [Player, PlayerControls, VolumeControl, TimePipe],
  exports: [Player],
  providers:[VideoCaptureService],
  imports: [
    BrowserModule,
    Ng2SemanticModule
  ]
})
export class PlayerModule {

}
