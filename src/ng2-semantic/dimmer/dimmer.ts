import {
  Component
} from '@angular/core';

@Component({
  selector: 'ui-dimmer',
  template: `
    <div class="ui" [ngClass]="{dimmed: hover, dimmable: hover}">
        <ng-content select=".ui-dimmer-content"></ng-content>
        <ng-content select=".ui.simple.dimmer"></ng-content>
    </div>
`,
  host: {
    '(mouseenter)': 'onMouseenter()',
    '(mouseleave)': 'onMouseleave()'
  }
})
export class UIDimmer {

  private _hover: boolean = false;

  get hover(): boolean {
    return this._hover;
  }

  onMouseenter(): boolean {
    this._hover = true;
    return false;
  }

  onMouseleave(): boolean {
    this._hover = false;
    return false;
  }
}

export var DIMMER_DIRECTIVES = [
  UIDimmer
];
