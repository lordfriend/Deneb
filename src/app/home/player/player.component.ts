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

@Component({
  selector: 'player',
  template: require('./player.html')
})
export class Player implements OnInit, AfterViewInit, OnDestroy {

  private _videoWidth:number = 1280;
  private _videoHeight:number = 720;
  private _playProgress:number = 0;
  private _bufferedProgress:number = 0;

  private _autoHideTimerSubscriber:Subscription;

  private _showControl:boolean = true;
  private _lastmoveTime:number = Date.now();

  private _sliderControlObservable:Observable<any>;
  private _sliderSubscription:Subscription;

  private isSeeking:boolean = false;

  @Input()
  episode:Episode;

  @Input()
  controlFadeOutTime:number = CONTROL_FADE_OUT_TIME;

  @ViewChild('video') _videoElementRef:ElementRef;
  @ViewChild('slider') _slider:ElementRef;

  playerId:string = 'videoPlayerId' + (nextId++);
  videoUrl:string;
  videoType:string;

  get containerWidth():string {
    return this._videoWidth + 'px';
  }

  get containerHeight():string {
    return this._videoHeight + 'px';
  }

  get playButtonIcon():string {
    if (this._videoElementRef) {
      let videoElement:HTMLVideoElement = this._videoElementRef.nativeElement;
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
    let videoElement:HTMLVideoElement = this._videoElementRef.nativeElement;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  onTimeUpdate() {
    if(!this.isSeeking) {
      let videoElement:HTMLVideoElement = this._videoElementRef.nativeElement;
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

  onChunkLoad() {
    if (this._videoElementRef) {
      let videoElement:HTMLVideoElement = this._videoElementRef.nativeElement;
      if (videoElement.buffered.length > 0) {
        let bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        let duration = videoElement.duration;
        this._bufferedProgress = Math.round(bufferedEnd / duration * 1000) / 10;
      }
    }
  }

  onDragSlider(mousedownEvent: MouseEvent) {
    let sliderElement = this._slider.nativeElement;
    this.isSeeking = true;
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
      () => {
      },
      () => {
        this.isSeeking = false;
      }
    );
  }

  onClickSlider(event:MouseEvent) {
    let ratio = this.getProgressRatio(this._slider.nativeElement, event);
    this._playProgress = Math.round(ratio * 1000) / 10;
    this.seekTo(ratio);
    this._lastmoveTime = Date.now();
  }

  toggleFullscreen() {
    let videoElement = this._videoElementRef.nativeElement;
    if(!document.fullscreenElement) {
      if(videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if(videoElement.msRequestFullscreen) {
        videoElement.msRequestFullscreen()
      } else if(videoElement.mozRequestFullScreen) {
        videoElement.mozRequestFullScreen();
      } else if(videoElement.webkitRequestFullscreen) {
        videoElement.webkitRequestFullscreen();
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
    let videoElement = this._videoElementRef.nativeElement;
    videoElement.currentTime = ratio * videoElement.duration;
  }

  ngOnInit():any {
    this.videoUrl = this.episode.videos[0];
    this.videoType = 'video/' + this.getExtname(this.videoUrl);
    return null;
  }


  ngAfterViewInit():any {
    this._autoHideTimerSubscriber = Observable.interval(1000)
      .subscribe(() => {
        if (this._showControl && !this.isSeeking) {
          var currentTime = Date.now();
          if (currentTime - this._lastmoveTime > this.controlFadeOutTime) {
            this._showControl = false;
          }
        }
      });

    return null;
  }


  ngOnDestroy():any {
    this._autoHideTimerSubscriber.unsubscribe();
    return null;
  }
}
