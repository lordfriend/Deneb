import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DIMMER_DIRECTIVES} from './dimmer/dimmer';
import {UI_IMAGE_PLACE_HOLDER_DIRECTIVES} from './image-placeholder/image-placeholder';
import {SLIDER_DIRECITVES} from './slider/slider';


@NgModule({
  declarations: [
    // ...INPUT_DIRECTIVES,
    ...DIMMER_DIRECTIVES,
    ...UI_IMAGE_PLACE_HOLDER_DIRECTIVES,
    ...SLIDER_DIRECITVES
  ],
  exports: [
    // ...INPUT_DIRECTIVES,
    ...DIMMER_DIRECTIVES,
    ...UI_IMAGE_PLACE_HOLDER_DIRECTIVES,
    ...SLIDER_DIRECITVES
  ],
  imports: [
    CommonModule
  ]
})
export class Ng2SemanticModule {

}
