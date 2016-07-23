import {
  Component,
  Input,
  Output,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  EventEmitter
} from '@angular/core'
import {Observable, Subscription} from 'rxjs/Rx';
import {closest} from '../../../../facade/lang';
import {TimePipe} from "../pipe/time.pipe";


@Component({
  selector: 'player-controls',
  template: require('./player-controls.html'),
  pipes: [TimePipe]
})
export class PlayerControls implements AfterViewInit, OnDestroy {

  private _isSeeking: boolean = false;
  private _isMouseMotion: boolean = false;

  private _dragObservable: Observable<any>;
  private _dragSubscription: Subscription;

  private _hoverObserable: Observable<any>;
  private _hoverSubscription: Subscription;

  private _intervalTimeObseravable: Observable<any>;
  private _intervalTimeSubscription: Subscription;

  private _progress;
  private _buffered;

  private _pointingOffsetX: number;
  private _hoveringProgress: boolean;

  private _lastkeyTimestamp: number = Date.now();

  isKeySeeking: boolean = false;
  pointingOffsetTime: number = 0;

  @Input() duration: number;
  @Input() currentTime: number;
  @Input() controlFadeOutTime: number;
  @Input() isPaused: boolean;

  @ViewChild('slider') sliderRef: ElementRef;
  @ViewChild('playerControls') playerControls: ElementRef;

  /**
   * out progress value is ratio digit
   * @type {EventEmitter<number>}
   */
  @Output() onProgressUpdate = new EventEmitter<number>();


  get isSeeking(): boolean {
    return this._isSeeking;
  }

  get playProgress(): string {
    return this._progress ? this._progress + '%' : 0 + '';
  }

  /**
   * Current play progress presented in percentage digit
   */
  @Input() set progress(progress: number) {
    if(!this._isSeeking) {
      this._progress = progress;
    }
  }

  get bufferedProgress(): string {
    return this._buffered ? this._buffered + '%' : 0 + '';
  }

  @Input() set buffered(progress: number) {
    this._buffered = progress;
  }

  get hoveringProgress(): boolean {
    return this._hoveringProgress;
  }

  get pointingOffsetX(): string {
    return this._pointingOffsetX ? this._pointingOffsetX + 'px' : 0 + '';
  }

  get showControl(): boolean {
    return this._isMouseMotion || this._isSeeking || this.isKeySeeking || this.isPaused;
  }

  onHoverProgress(event: MouseEvent) {
    let sliderElement = this.sliderRef.nativeElement;
    if(!this.isInRect(sliderElement, event)) {
      this._hoveringProgress = false;
      return;
    }
    this._hoveringProgress = true;
    let width = sliderElement.getBoundingClientRect().width;
    let ratio = this.getProgressRatio(sliderElement, event);
    this._pointingOffsetX = width * ratio;
    this.pointingOffsetTime = this.duration * ratio;
  }

  endHoverProgress() {
    this._hoveringProgress = false;
  }


  onClickSlider(event: MouseEvent) {
    let ratio = this.getProgressRatio(this.sliderRef.nativeElement, event);
    this._progress = Math.round(ratio * 1000) / 10;
    this.onProgressUpdate.emit(ratio);
  }

  seeking(lastKeyTimestamp: number) {
    this.isKeySeeking = true;
    this._lastkeyTimestamp = lastKeyTimestamp;
  }

  private getProgressRatio(sliderElement: HTMLElement, event: MouseEvent):number {
    let rect = sliderElement.getBoundingClientRect();
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

  private isInRect(element: HTMLElement, event: MouseEvent): boolean {
    let rect = element.getBoundingClientRect();
    return (rect.left < event.clientX) && (rect.top < event.clientY) && (rect.bottom > event.clientY) && (rect.right > event.clientX);
  }

  ngOnDestroy():any {
    this._dragSubscription.unsubscribe();
    this._hoverSubscription.unsubscribe();
    this._intervalTimeSubscription.unsubscribe();
    return null;
  }

  ngAfterViewInit():any {
    let slider = this.sliderRef.nativeElement;
    this._dragObservable = Observable.fromEvent(slider, 'mousedown')
      .flatMap((event: MouseEvent) => {
        this._isSeeking = true;
        this._progress = Math.round(this.getProgressRatio(slider, event) * 1000) / 10;

        return Observable.fromEvent(slider, 'mousemove')
          .takeUntil(Observable.fromEvent(slider, 'mouseup').map((event: MouseEvent) => {
            this.onProgressUpdate.emit(this.getProgressRatio(slider, event));
            this._isSeeking = false;
            return 0;
          }))
          .map((event:MouseEvent) => {
            return this.getProgressRatio(slider, event);
          })
          .map((ratio:number) => {
            this._progress = Math.round(ratio * 1000) / 10;
            return ratio;
          })
      });

    this._dragSubscription = this._dragObservable.subscribe(
      () => {},
      () => {}
    );

    let videoControls = this.playerControls.nativeElement;
    let videoContainer = closest(videoControls, '.video-container');

    this._hoverObserable = Observable.fromEvent(videoContainer, 'mouseenter')
      .flatMap(() => {
        this._isMouseMotion = true;
        videoContainer.classList.remove('hide-cursor');
        return Observable.fromEvent(videoContainer, 'mousemove')
          .takeUntil(Observable.fromEvent(videoContainer, 'mouseleave')
            .map(() => {
              this._isMouseMotion = false;
              return 0;
            }))
          .timeout(this.controlFadeOutTime)
          .do(() => {}, () => {
            this._isMouseMotion = false;
            videoContainer.classList.add('hide-cursor');
          })
          .retry()
          .map(() => {
            this._isMouseMotion = true;
            videoContainer.classList.remove('hide-cursor');
          })
      });

    this._hoverSubscription = this._hoverObserable.subscribe(
      () => {},
      () => {}
    );

    this._intervalTimeObseravable = Observable.interval(300)
      .map(() => {
        if(Date.now() - this._lastkeyTimestamp > this.controlFadeOutTime) {
          this.isKeySeeking = false;
        }
        return 0;
      });

    this._intervalTimeSubscription = this._intervalTimeObseravable.subscribe(
      () => {},
      () => {}
    );

    return null;
  }
}
