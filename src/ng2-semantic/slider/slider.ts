import {
  Component, ViewChild, ElementRef, Input, Output, EventEmitter,
  AfterViewInit
} from '@angular/core';
import {Observable, Subscription} from "rxjs/Rx";

@Component({
  selector: 'ui-slider',
  template: `
    <div class="slider-wrapper" (click)="onClickSlider($event)" #sliderBar>
      <div class="slider-bar">
        <template [ngIf]="orientation === 'horizontal'">
          <div class="slider-bar-progress" [style.width]="progressStr"></div>
          <div class="slider-bar-dragger" [style.left]="progressStr"></div>
          <div class="ui pointing below label" [style.left]="progressStr" [ngClass]="{show: indicatorVisibility}">
            {{progressStr}}
          </div>
        </template>
        <template [ngIf]="orientation === 'vertical'">
          <div class="slider-bar-progress" [style.height]="progressStr"></div>
          <div class="slider-bar-dragger" [style.bottom]="progressStr"></div>
          <div class="ui right pointing label" [style.bottom]="progressStr" [ngClass]="{show: indicatorVisibility}">
            {{progressStr}}
          </div>
        </template>
      </div>
    </div>
`,
  host: {
    '[class.vertical]': 'orientation === "vertical"',
    '[class.horizontal]': 'orientation === "horizontal"'
  }
})
export class UISlider implements AfterViewInit {

  private _progress: number;
  private _sliderControlObservable: Observable<any>;
  private _sliderSubscription: Subscription;
  private _isSeeking: boolean = false;

  @Input() orientation: 'vertical' | 'horizontal' = 'horizontal';
  @Input() showIndicator: 'seeking' | 'always' | 'never' = 'seeking';

  @Input() set progress(pg: number) {
    this._progress = pg;
  }

  @Output() changes: EventEmitter<number> = new EventEmitter<number>();
  @Output() release: EventEmitter<number> = new EventEmitter<number>();

  get progressStr(): string {
    if(this._progress) {
      return Math.round(this._progress * 100) + '%';
    } else {
      return 0 + '';
    }
  }

  get indicatorVisibility(): boolean {
    if(this.showIndicator === 'never') {
      return false;
    } else if (this.showIndicator === 'always') {
      return true;
    } else if (this.showIndicator === 'seeking') {
      return this._isSeeking;
    }
  }

  private getProgressRatio(element: HTMLElement, event: MouseEvent) {
    let rect = element.getBoundingClientRect();
    if(this.orientation === 'horizontal') {
      let offsetX = 0;
      if (event.clientX < rect.left + 1) {
        offsetX = 0;
      } else if (event.clientX > rect.right - 1) {
        offsetX = rect.width - 2;
      } else {
        offsetX = event.clientX - (rect.left + 1);
      }
      return offsetX / (rect.width - 2);
    } else {
      let offsetY = 0;
      if (event.clientY > rect.bottom - 1) {
        offsetY = 0;
      } else if (event.clientY < rect.top + 1) {
        offsetY = rect.height - 2;
      } else {
        offsetY = (rect.bottom - 1) - event.clientY;
      }
      return offsetY / (rect.height - 2);
    }

  }

  @ViewChild('sliderBar') sliderBarRef: ElementRef;

  onClickSlider(event: MouseEvent) {
    let ratio = this.getProgressRatio(this.sliderBarRef.nativeElement, event);
    this._progress = ratio;
    this.changes.emit(this._progress);
    this.release.emit(this._progress);
  }

  ngAfterViewInit():any {
    let sliderBar = this.sliderBarRef.nativeElement;
    this._sliderControlObservable = Observable.fromEvent(sliderBar, 'mousedown')
      .flatMap((event: MouseEvent) => {
        this._isSeeking = true;
        this._progress = this.getProgressRatio(sliderBar, event);
        return Observable.fromEvent(sliderBar, 'mousemove')
          .takeUntil(Observable.fromEvent(document, 'mouseup')
            .map((event: MouseEvent) => {
              this._isSeeking = false;
              this._progress = this.getProgressRatio(sliderBar, event);
              this.release.emit(this._progress);
            }))
          .map((event:MouseEvent) => {
            return this.getProgressRatio(sliderBar, event);
          })
          .map((ratio: number) => {
            this._progress = ratio;
            this.changes.emit(this._progress);
            return 0;
          });
      });
    this._sliderSubscription = this._sliderControlObservable.subscribe(
      () => {},
      () => {}
    );
    return null;
  }
}

export var SLIDER_DIRECITVES = [
  UISlider
];
