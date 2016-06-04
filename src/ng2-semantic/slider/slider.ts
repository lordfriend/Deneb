import {Component} from '@angular/core';

@Component({
  selector: 'ui-slider',
  template: `
    <div class="slider-wrapper" (click)="onClick()">
      <div class="slider-bar">
        <div class="slider-bar-progress"></div>
        <div class="slider-bar-dragger"></div>
      </div>
    </div>
`
})
export class UISlider {
  onClick() {
    
  }
}
