import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import {Episode} from "../../entity/episode";
import {Observable} from "rxjs/Rx";
import {TimePipe} from "./pipe/time.pipe";
import {PlayerControls} from './player-controls/player-controls.component';
import {VolumeControl} from './volumne-control/volume-control.component';
import {VideoCaptureService} from "./video-capture/video-capture.service";

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
  pipes: [TimePipe],
  directives: [PlayerControls, VolumeControl],
  providers: [VideoCaptureService]
})
export class Player implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  private _videoWidth:number;
  private _videoHeight:number;
  private _playProgress:number = 0;
  private _bufferedProgress:number = 0;

  private _fullscreenMode: boolean = false;

  private _fullScreenChangeHandler: () => {};
  private _windowResizeHandler: () => {};

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
  @ViewChild(PlayerControls) playerControls: PlayerControls;

  playerId:string = 'videoPlayerId' + (nextId++);
  videoUrl:string;
  videoType:string;
  paused: boolean = true;
  ended: boolean = false;

  pointingOffsetTime: number = 0;
  showVolumeControl: boolean = false;
  showCaptureOverlay: boolean = false;

  constructor(
    private _captureService: VideoCaptureService
  ) {
    this._fullScreenChangeHandler = this.onFullscreenChange.bind(this);
    this._windowResizeHandler = this.onWindowReisze.bind(this);
  }

  get currentTime(): number {
    return this._currentTime;
  }

  get duration(): number {
    return this._duration;
  }

  get volume(): number {
    if(this.videoElementRef) {
      let videoElement: HTMLVideoElement = this.videoElementRef.nativeElement;
      return videoElement.volume;
    } else {
      return 1;
    }
  }

  get muted(): boolean {
    if(this.videoElementRef) {
      let videoElement: HTMLVideoElement = this.videoElementRef.nativeElement;
      return videoElement.muted;
    } else {
      return false;
    }
  }

  get playProgress(): number {
    return this._playProgress;
  }

  get bufferedProgress(): number {
    return this._bufferedProgress;
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
    if(videoElement.error && videoElement.error.code === MediaError.MEDIA_ERR_NETWORK) {
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

  onClickPlay(event: Event) {
    let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
    if(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  captureFrame(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if(this._captureService.downloadSupport) {
      this._captureService.download(this.videoElementRef.nativeElement, this.episode.bangumi.name, this.episode.episode_no, this.currentTime);
    } else {
      this.showCaptureOverlay = true;
      let framePreviewHolder = this.videoContainerRef.nativeElement.querySelector('.capture-overlay');
      let previewCanvas = framePreviewHolder.querySelector('.preview-canvas');
      this._captureService.captureOnCanvas(this.videoElementRef.nativeElement, previewCanvas);
    }
  }

  closeCaptureOverlay(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showCaptureOverlay = false;
  }

  onWaiting() {
    console.log('waiting...');
  }

  onPlay() {
    this.paused = false;
    this.ended = false;
    this._playButton = 'pause';
  }

  onPause() {
    this.paused = true;
    this._playButton = 'play';
  }

  onEnded() {
    this.ended = true;
    this._playButton = 'repeat';
  }

  onTimeUpdate() {
    let videoElement:HTMLVideoElement = this.videoElementRef.nativeElement;
    this._currentTime = videoElement.currentTime;
    this._playProgress = Math.round(this._currentTime / this._duration * 1000) / 10;
  }

  onDurationChange(event: Event) {
    this._duration = (<HTMLMediaElement> event.target).duration;
  }

  onMetadataLoaded() {
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

  onSeeking(event: Event, direction: string) {
    event.preventDefault();
    event.stopPropagation();
    let videoElement = this.videoElementRef.nativeElement;
    let currentTime = videoElement.currentTime;
    let duration = videoElement.duration;
    if(direction === 'right') {
      currentTime += 5;
      if(currentTime > duration) {
        currentTime = duration;
      }
    } else if(direction === 'left') {
      currentTime -= 5;
      if(currentTime < 0) {
        currentTime = 0;
      }
    }
    videoElement.currentTime = currentTime;

    this.playerControls.seeking(Date.now());
  }

  changeVolume(vol: number) {
    let videoElement: HTMLVideoElement = this.videoElementRef.nativeElement;
    videoElement.volume = vol;
  }

  toggleVolumeControl() {
    this.showVolumeControl = !this.showVolumeControl;
  }

  // muteVolume() {
  //   let videoElement: HTMLVideoElement = this.videoElementRef.nativeElement;
  //   videoElement.muted = !videoElement.muted;
  // }

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

  private setVideoUrl() {
    this.videoUrl = this.episode.videos[0];
    this.videoType = 'video/' + this.getExtname(this.videoUrl);
  }

  seekTo(ratio) {
    let videoElement = this.videoElementRef.nativeElement;
    videoElement.currentTime = ratio * videoElement.duration;
  }

  ngOnInit():any {
    return null;
  }

  ngOnChanges(changes: SimpleChanges): any {
    if(changes['episode']) {
      this.setVideoUrl();
      if(changes['episode'].previousValue['videos']) {
        this.videoElementRef.nativeElement.load();
        this.videoElementRef.nativeElement.play();
      }
    }
    return null;
  }

  ngAfterViewInit(): any {
    return null;
  }


  ngOnDestroy():any {
    window.removeEventListener('resize', this._windowResizeHandler);
    document.removeEventListener('fullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('webkitfullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('mozfullscreenchange', this._fullScreenChangeHandler);
    document.removeEventListener('MSFullscreenChange', this._fullScreenChangeHandler);
    return null;
  }
}
