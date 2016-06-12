import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef, OnDestroy
} from '@angular/core';
import {Episode} from "../../entity/episode";
import {Observable, Subscription} from "rxjs/Rx";
import {TimePipe} from "./pipe/time.pipe";

let nextId = 0;

const HAVE_NOTHING = 0;
const HAVE_METADATA = 1;
const HAVE_CURRENT_DATA = 2;
const HAVE_FUTURE_DATA = 3;
const HAVE_ENOUGH_DATA = 4;

const CONTROL_FADE_OUT_TIME = 3000;

// scale pattern

const KEEP_RESERVED_SPACE = 0; // will keep the reserved space and strech the video if space is not enough
const FIT_ORIGINAL = 1; // if space is enough will scale up to the original video size
const FULL_SCREEN = 2;

const noop = () => {};

@Component({
  selector: 'player',
  template: require('./player.html'),
  pipes: [TimePipe]
})
export class Player implements OnInit, AfterViewInit, OnDestroy {

  private _videoWidth:number;
  private _videoHeight:number;
  private _playProgress:number = 0;
  private _bufferedProgress:number = 0;

  private _autoHideSubscription:Subscription;

  private _showControl:boolean = true;

  private _sliderControlObservable:Observable<any>;
  private _sliderSubscription:Subscription;

  private _isSeeking:boolean = false;

  private _fullscreenMode: boolean = false;

  private _fullScreenChangeHandler: () => {};
  private _windowResizeHandler: () => {};

  private _hoveringProgress: boolean = false;

  private _pointingOffsetX: number = 0;
  private _currentTime: number = 0;
  private _duration: number = 0;

  private _playButton: string = 'play';

  private _delayedResizeTimerId: number;

  private _isError: boolean = false;
  private _lastStalledPosition: number;
  private _isStalled: boolean = false;

  @Input()
  episode:Episode;

  @Input()
  controlFadeOutTime:number = CONTROL_FADE_OUT_TIME;

  @Input()
  reservedSpaceHeight:number = 0;

  @ViewChild('videoContainer') videoContainerRef: ElementRef;
  @ViewChild('video') videoElementRef:ElementRef;
  @ViewChild('slider') sliderElementRef:ElementRef;

  playerId:string = 'videoPlayerId' + (nextId++);
  videoUrl:string;
  videoType:string;

  pointingOffsetTime: number = 0;


  constructor() {
    this._fullScreenChangeHandler = this.onFullscreenChange.bind(this);
    this._windowResizeHandler = this.onWindowReisze.bind(this);
  }

  //noinspection JSUnusedGlobalSymbols
  get currentTime(): number {
    return this._currentTime;
  }

  get duration(): number {
    return this._duration;
  }

  get hoveringProgress(): boolean {
    return this._hoveringProgress;
  }

  get pointingOffsetX(): string {
    return this._pointingOffsetX ? this._pointingOffsetX + 'px' : 0 + '';
  }

  get containerWidth():string {
    if(this._fullscreenMode) {
      return '100%';
    } else {
      return this._videoWidth ? this._videoWidth + 'px' : 'auto';
    }
  }

  get containerHeight():string {
    if(this._fullscreenMode) {
      return '100%';
    } else {
      return this._videoHeight ? this._videoHeight + 'px' : 'auto';
    }
  }

  get playButtonIcon():string {
    return this._playButton;
  }

  get playProgress(): string {
    return this._playProgress ? this._playProgress + '%' : 0 + '';
  }

  get bufferedProgress():string {
    return this._bufferedProgress ? this._bufferedProgress + '%' : 0 + '';
  }

  get showControl():boolean {
    return this._showControl;
  }

  get showLoader(): boolean {
    if(this.videoElementRef) {
      let videoElement = this.videoElementRef.nativeElement;
      return (this._isStalled || videoElement.readyState < HAVE_FUTURE_DATA) && !videoElement.paused;
    } else {
      return false;
    }
  }

  get isError(): boolean {
    return this._isError;
  }

  onError(error: MediaError) {
    console.log(error);
    let videoElement = this.videoElementRef.nativeElement;
    if(videoElement.error.code === MediaError.MEDIA_ERR_NETWORK) {
      videoElement.pause();
      console.log('current_time', this._currentTime);
      this._lastStalledPosition = this._currentTime;
      this._isError = true;
    }
  }

  onStalled() {
    this._isStalled = true;
    console.log('stalled');
  }

  retry(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    let videoElement = this.videoElementRef.nativeElement;
    videoElement.load();
    this._isError = false;
    let retrySubscription = Observable.fromEvent(videoElement, 'canplay')
      .takeUntil(Observable.fromEvent(videoElement, 'seeked'))
      .timeout(5000)
      .retry(3)
      .subscribe(
        () => {
          console.log('resumed', videoElement.duration);
          videoElement.currentTime = this._lastStalledPosition;
        },
        () => {},
        () => {
          retrySubscription.unsubscribe();
        }
      )
  }

  onClickPlay() {
    let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  onSuspend() {
    console.log('suspend');
  }

  onWaiting() {
    console.log('waiting...');
  }

  onPlay() {
    console.log('playing');
    this._playButton = 'pause';
  }

  onPause() {
    console.log('pausing');
    this._playButton = 'play';
  }

  onEnded() {
    this._playButton = 'repeat';
  }

  onTimeUpdate() {
    let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
    this._currentTime = videoElement.currentTime;
    if(!this._isSeeking) {
      let duration = videoElement.duration;
      this._playProgress = Math.round(this._currentTime / duration * 1000) / 10;
    }
  }

  onEnterContainer() {
    this._showControl = true;
    let videoContainerElement = this.videoContainerRef.nativeElement;

    this._autoHideSubscription = Observable.fromEvent(videoContainerElement, 'mousemove')
      .merge(Observable.interval(500).filter(() => this._isSeeking))
      .takeUntil(Observable.fromEvent(videoContainerElement, 'mouseleave')
        .map((event) => {
          this._showControl = false;
          return event;
        }))
      .timeout(this.controlFadeOutTime)
      .do(noop, () => {this._showControl = false;})
      .retry()
      .subscribe(
        () => {
          this._showControl = true;
        }
      );
  }

  onMetadataLoaded() {

    this._duration = this.videoElementRef.nativeElement.duration;

    window.addEventListener('resize', this._windowResizeHandler, false);

    document.addEventListener('fullscreenchange', this._fullScreenChangeHandler, false);
    document.addEventListener('webkitfullscreenchange', this._fullScreenChangeHandler, false);
    document.addEventListener('mozfullscreenchange', this._fullScreenChangeHandler, false);
    document.addEventListener('MSFullscreenChange', this._fullScreenChangeHandler, false);
  }

  onVideoResized() {
    console.log('video resized');
    this.scaleVideoContainer(KEEP_RESERVED_SPACE);
  }

  private scaleVideoContainer(pattern: number) {
    let videoElement = this.videoElementRef.nativeElement;

    let reservedSpaceHeight = this.reservedSpaceHeight;

    let videoWidth = videoElement.videoWidth;
    let videoHeight = videoElement.videoHeight;
    let viewportWidth = window.innerWidth;

    let viewportHeight = window.innerHeight;
    if(pattern === KEEP_RESERVED_SPACE) {
      viewportHeight = viewportHeight- reservedSpaceHeight;
    }

    let videoRatio = videoWidth / videoHeight;
    let viewportRatio = viewportWidth / viewportHeight;

    if(pattern === FULL_SCREEN) {
      if(videoRatio > viewportRatio) {
        this._videoWidth = viewportWidth;
        this._videoHeight = viewportWidth / videoRatio;
      } else {
        this._videoHeight = viewportHeight;
        this._videoWidth = viewportHeight * videoRatio;
      }
    } else {
      if(videoRatio > viewportRatio && videoWidth > viewportWidth) {
        this._videoWidth = viewportWidth;
        this._videoHeight = viewportWidth / videoRatio;
      } else if(videoRatio < viewportRatio && videoHeight > viewportHeight) {
        this._videoHeight = viewportHeight;
        this._videoWidth = viewportHeight * videoRatio;
      } else {
        this._videoWidth = videoWidth;
        this._videoHeight = videoHeight;
      }
    }
  }

  onChunkLoad() {
    if(this._isStalled) {
      this._isStalled = false;
    }
    if (this.videoElementRef) {
      let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
      if (videoElement.buffered.length > 0) {
        let bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        let duration = videoElement.duration;
        this._bufferedProgress = Math.round(bufferedEnd / duration * 1000) / 10;
      }
    }
  }

  onDragSlider(mousedownEvent: MouseEvent) {
    let sliderElement = this.sliderElementRef.nativeElement;
    this._isSeeking = true;

    this._playProgress = Math.round(this.getProgressRatio(sliderElement, mousedownEvent) * 1000) / 10;

    this._sliderControlObservable = Observable.fromEvent(document, 'mousemove')
      .takeUntil(Observable.fromEvent(document, 'mouseup'))
      .map((event:MouseEvent) => {
        return this.getProgressRatio(sliderElement, event);
      })
      .map((ratio:number) => {
        this._playProgress = Math.round(ratio * 1000) / 10;
        return ratio;
      })
      .takeLast(1);

    this._sliderSubscription = this._sliderControlObservable.subscribe(
      (ratio:number) => {
        this.seekTo(ratio);
      },
      () => {},
      () => {
        this._isSeeking = false;
      }
    );
  }

  onClickSlider(event:MouseEvent) {
    let ratio = this.getProgressRatio(this.sliderElementRef.nativeElement, event);
    this._playProgress = Math.round(ratio * 1000) / 10;
    this.seekTo(ratio);
  }

  onHoverProgress(event: MouseEvent) {
    let sliderElement = this.sliderElementRef.nativeElement;
    if(!this.isInRect(sliderElement, event)) {
      this._hoveringProgress = false;
      return;
    }
    this._hoveringProgress = true;
    let width = sliderElement.getBoundingClientRect().width;
    let ratio = this.getProgressRatio(sliderElement, event);
    this._pointingOffsetX = width * ratio;
    this.pointingOffsetTime = this.videoElementRef.nativeElement.duration * ratio;
  }

  endHoverProgress() {
    this._hoveringProgress = false;
  }

  toggleFullscreen() {
    let videoContainer = this.videoContainerRef.nativeElement;
    if(!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      if(videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if(videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen()
      } else if(videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
      } else if(videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      }
    } else {

      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  private onWindowReisze() {
    console.log('resized', window.innerWidth, window.innerHeight);
    if(!this._fullscreenMode) {
      this.scaleVideoContainer(KEEP_RESERVED_SPACE);
    } else {
      this.scaleVideoContainer(FULL_SCREEN);
    }
  }

  private onFullscreenChange() {
    let videoContainerElement = this.videoContainerRef.nativeElement;
    if(!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      console.log('fullscreen off');
      this._fullscreenMode = false;
      videoContainerElement.classList.remove('fullscreen');
    } else {
      console.log('fullscreen on');
      this._fullscreenMode = true;
      videoContainerElement.classList.add('fullscreen');
    }

    clearTimeout(this._delayedResizeTimerId);

    this._delayedResizeTimerId = window.setTimeout(() => {
      if(this._fullscreenMode) {
        this.scaleVideoContainer(FULL_SCREEN);
      } else {
        this.scaleVideoContainer(KEEP_RESERVED_SPACE);
      }

    }, 500);
  }

  private getExtname(url:string) {
    let parts = url.split('.');
    return parts[parts.length - 1];
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

  private seekTo(ratio) {
    let videoElement = this.videoElementRef.nativeElement;
    videoElement.currentTime = ratio * videoElement.duration;
  }

  ngOnInit():any {
    this.videoUrl = this.episode.videos[0];
    this.videoType = 'video/' + this.getExtname(this.videoUrl);
    return null;
  }


  ngAfterViewInit():any {
    return null;
  }


  ngOnDestroy():any {
    if(this._autoHideSubscription) {
      this._autoHideSubscription.unsubscribe();
    }
    if(this._sliderSubscription) {
      this._sliderSubscription.unsubscribe();
    }
    window.removeEventListener('resize', this._windowResizeHandler);
    document.removeEventListener('fullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('webkitfullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('mozfullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('MSFullscreenChange', this._fullScreenChangeHandler);
    return null;
  }
}
