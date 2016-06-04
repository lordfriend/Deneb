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

@Component({
  selector: 'player',
  template: require('./player.html')
})
export class Player implements OnInit, AfterViewInit, OnDestroy {

  private _videoWidth:number = 1280;
  private _videoHeight:number = 720;
  private _playProgress:number = 0;
  private _bufferedProgress:number = 0;

  private _autoHideSubscription:Subscription;

  private _showControl:boolean = true;
  private _lastmoveTime:number = Date.now();

  private _sliderControlObservable:Observable<any>;
  private _sliderSubscription:Subscription;

  private _isSeeking:boolean = false;

  private _fullscreenMode: boolean = false;

  private _fullScreenChangeHandler: () => {};
  private _windowResizeHandler: () => {};

  @Input()
  episode:Episode;

  @Input()
  controlFadeOutTime:number = CONTROL_FADE_OUT_TIME;
  @ViewChild('videoContainer') videoContainerRef: ElementRef;
  @ViewChild('video') videoElementRef:ElementRef;
  @ViewChild('slider') sliderElementRef:ElementRef;

  playerId:string = 'videoPlayerId' + (nextId++);
  videoUrl:string;
  videoType:string;

  constructor() {
    this._fullScreenChangeHandler = this.onFullscreenChange.bind(this);
    this._windowResizeHandler = this.onWindowReisze.bind(this);
  }

  get containerWidth():string {
    return this._videoWidth + 'px';
  }

  get containerHeight():string {
    return this._videoHeight + 'px';
  }

  get playButtonIcon():string {
    if (this.videoElementRef) {
      let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
      return videoElement.paused ? 'play' : 'pause';
    } else {
      return 'play';
    }
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

  onClickPlay() {
    let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  onTimeUpdate() {
    if(!this._isSeeking) {
      let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
      let currentTime = videoElement.currentTime;
      let duration = videoElement.duration;
      this._playProgress = Math.round(currentTime / duration * 1000) / 10;
    }
  }

  onMousemove() {
    this._lastmoveTime = Date.now();
    if (!this._showControl) {
      this._showControl = true;
    }
  }

  onMetadataLoaded() {
    this.scaleVideoContainer(KEEP_RESERVED_SPACE);

    window.addEventListener('resize', this._windowResizeHandler, false);

    document.addEventListener('fullscreenchange', this._fullScreenChangeHandler, false);
    document.addEventListener('webkitfullscreenchange', this._fullScreenChangeHandler, false);
    document.addEventListener('mozfullscreenchange', this._fullScreenChangeHandler, false);
    document.addEventListener('MSFullscreenChange', this._fullScreenChangeHandler, false);
  }

  private scaleVideoContainer(pattern: number) {
    let videoElement = this.videoElementRef.nativeElement;

    let reservedSpaceHeight = 0;

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
    this._lastmoveTime = Date.now();


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
    this._lastmoveTime = Date.now();
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

    if(!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      console.log('fullscreen off');
      this._fullscreenMode = false;
    } else {
      this._fullscreenMode = true;
      console.log('fullscreen on');
    }
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
    this._autoHideSubscription = Observable.interval(1000)
      .subscribe(() => {
        if (this._showControl && !this._isSeeking) {
          var currentTime = Date.now();
          if (currentTime - this._lastmoveTime > this.controlFadeOutTime) {
            this._showControl = false;
          }
        }
      });

    return null;
  }


  ngOnDestroy():any {
    this._autoHideSubscription.unsubscribe();
    document.removeEventListener('fullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('webkitfullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('mozfullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('MSFullscreenChange', this._fullScreenChangeHandler);
    return null;
  }
}
