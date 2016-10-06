import {NgModule} from '@angular/core';
import {DIMMER_DIRECTIVES} from './dimmer/dimmer';
import {UI_IMAGE_PLACE_HOLDER_DIRECTIVES} from './image-placeholder/image-placeholder';
import {PAGINATION_DIRECTIVES} from './pagination/pagination';
import {SLIDER_DIRECITVES} from './slider/slider';
import {BrowserModule} from '@angular/platform-browser';


@NgModule({
  declarations: [
    // ...INPUT_DIRECTIVES,
    ...DIMMER_DIRECTIVES,
    ...UI_IMAGE_PLACE_HOLDER_DIRECTIVES,
    ...PAGINATION_DIRECTIVES,
    ...SLIDER_DIRECITVES
  ],
  exports: [
    // ...INPUT_DIRECTIVES,
    ...DIMMER_DIRECTIVES,
    ...UI_IMAGE_PLACE_HOLDER_DIRECTIVES,
    ...PAGINATION_DIRECTIVES,
    ...SLIDER_DIRECITVES
  ],
  imports: [
    BrowserModule
  ]
})
export class Ng2SemanticModule {

}
