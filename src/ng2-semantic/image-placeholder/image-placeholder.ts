import {
  Component,
  Directive,
  Self,
  ViewChild,
  AfterContentInit,
  Input
} from '@angular/core';


@Component({
  selector: 'ui-image-placeholder',
  template: `
    <div class="image-wrapper" [ngClass]="status">
      <img [src]="imageUrl" alt="" (load)="onLoad()" (error)="onError()">
      <ng-content select=".ui-image-fallback"></ng-content>
    </div>
`
})
export class UIImagePlaceholder {

  private STATUS_LOADED = 'loaded';
  private STATUS_FALLBACK = 'fallback';

  status: string = this.STATUS_FALLBACK;

  @Input()
  imageUrl: string;

  onLoad():boolean {
    this.status = this.STATUS_LOADED;
    return false;
  }

  onError():boolean {
    this.status = this.STATUS_FALLBACK;
    return false;
  }

}

export var UI_IMAGE_PLACE_HOLDER_DIRECTIVES = [
  UIImagePlaceholder
];
