import {Component, ViewChild, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from "rxjs/Rx";

@Component({
  selector: 'ui-slider',
  template: `
    <div class="slider-wrapper" (mousedown)="onDragSlider($event)">
      <div class="slider-bar" #sliderBar>
        <div class="slider-bar-progress" [style.width]="progressStr"></div>
        <div class="slider-bar-dragger" [style.left]="progressStr"></div>
      </div>
    </div>
`
})
export class UISlider {

  private _progress;
  private _sliderControlObservable;
  private _sliderSubscription;

  @Input() set progress(pg: number) {
    this._progress = pg;
  }

  @Output() changes: EventEmitter<number> = new EventEmitter<number>();
  @Output() release: EventEmitter<number> = new EventEmitter<number>();

  get progressStr(): string {
    if(this._progress) {
      return this._progress + '%';
    } else {
      return 0 + '';
    }
  }

  private getProgressRatio(element: HTMLElement, event: MouseEvent) {
    let rect = element.getBoundingClientRect();
    let offsetX = 0;
    if (event.clientX < rect.left + 1) {
      offsetX = 0;
    } else if (event.clientX > rect.right - 1) {
      offsetX = rect.width;
    } else {
      offsetX = event.clientX - (rect.left + 1);
    }
    return offsetX / (rect.width - 2);
  }

  @ViewChild('sliderBar') sliderBarRef: ElementRef;

  onClickSlider(event: MouseEvent) {
    let ratio = this.getProgressRatio(this.sliderBarRef.nativeElement, event);
    this._progress = Math.round(ratio * 1000) / 10;
    this.changes.emit(this._progress);
    console.log('click');
    this.release.emit(this._progress);
  }


  onDragSlider(mousedownEvent: MouseEvent) {
    let sliderElement = this.sliderBarRef.nativeElement;

    this._progress = Math.round(this.getProgressRatio(sliderElement, mousedownEvent) * 1000) / 10;

    this._sliderControlObservable = Observable.fromEvent(document, 'mousemove')
      .takeUntil(Observable.fromEvent(document, 'mouseup'))
      .map((event:MouseEvent) => {
        return this.getProgressRatio(sliderElement, event);
      });

    this._sliderSubscription = this._sliderControlObservable.subscribe(
      (ratio:number) => {
        this._progress = Math.round(ratio * 1000) / 10;
        this.changes.emit(this._progress);
      },
      () => {},
      () => {
        console.log('mouse up');
        this.release.emit(this._progress);
      }
    );
  }

}

export var SLIDER_DIRECITVES = [
  UISlider
];
