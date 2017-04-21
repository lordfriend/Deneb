import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DIMMER_DIRECTIVES} from './dimmer/dimmer';
import {SLIDER_DIRECITVES} from './slider/slider';


@NgModule({
  declarations: [
    // ...INPUT_DIRECTIVES,
    ...DIMMER_DIRECTIVES,
    ...SLIDER_DIRECITVES
  ],
  exports: [
    // ...INPUT_DIRECTIVES,
    ...DIMMER_DIRECTIVES,
    ...SLIDER_DIRECITVES
  ],
  imports: [
    CommonModule
  ]
})
export class Ng2SemanticModule {

}
