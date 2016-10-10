import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Player} from './player.component';
import {PlayerControls} from './player-controls/player-controls.component';
import {TimePipe} from './pipe/time.pipe';
import {VideoCaptureService} from './video-capture/video-capture.service';
import {VolumeControl} from './volumne-control/volume-control.component';
import {Ng2SemanticModule} from '../../../ng2-semantic';

@NgModule({
  declarations: [Player, PlayerControls, VolumeControl, TimePipe],
  exports: [Player],
  providers:[VideoCaptureService],
  imports: [
    CommonModule,
    Ng2SemanticModule
  ]
})
export class PlayerModule {

}
