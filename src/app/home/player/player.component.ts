import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {Episode} from "../../entity/episode";
import {Observable} from "rxjs/Observable";

let nextId = 0;

const HAVE_NOTHING = 0;
const HAVE_METADATA = 1;
const HAVE_CURRENT_DATA = 2;
const HAVE_FUTURE_DATA = 3;
const HAVE_ENOUGH_DATA = 4;


@Component({
  selector: 'player',
  template: require('./player.html')
})
export class Player implements OnInit {

  private _videoWidth: number = 1280;
  private _videoHeight: number = 720;
  private _playProgress: number = 0;

  //noinspection TypeScriptUnresolvedFunction
  private _autoHideTimer: Observable<any> = Observable.interval(1000);
  private _showControl: boolean = true;
  private _lastmoveTime: number = Date.now();

  @Input()
  episode:Episode;

  @ViewChild('video') _videoElementRef: ElementRef;

  playerId:string = 'videoPlayerId' + (nextId++);
  videoUrl: string;
  videoType: string;

  get containerWidth(): string {
    return this._videoWidth + 'px';
  }

  get containerHeight(): string {
    return this._videoHeight + 'px';
  }

  get playButtonIcon(): string {
    if(this._videoElementRef) {
      let videoElement: HTMLVideoElement = this._videoElementRef.nativeElement;
      return videoElement.paused ? 'play': 'pause';
    } else {
      return 'play';
    }
  }

  get playProgress(): string {
    return this._playProgress ? this._playProgress + '%' : 0 + '';
  }

  get showControl(): boolean {
    return this._showControl;
  }

  onClickPlay() {
    let videoElement: HTMLVideoElement = this._videoElementRef.nativeElement;
    if(videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  onTimeUpdate() {
    if(this._videoElementRef) {
      let videoElement: HTMLVideoElement = this._videoElementRef.nativeElement;
      let currentTime = videoElement.currentTime;
      let duration = videoElement.duration;
      this._playProgress = Math.round(currentTime / duration * 1000) / 10;
    }
  }

  onMousemove() {
    this._lastmoveTime = Date.now();
    if(!this._showControl) {
      this._showControl = true;
    }
  }

  private getExtname(url: string) {
    let parts = url.split('.');
    return parts[parts.length - 1];
  }

  private _checkControlTimeout() {
    if(this._showControl) {
      var currentTime = Date.now();
      if(currentTime - this._lastmoveTime > 3000) {
        this._showControl = false;
      }
    }
  }

  ngOnInit():any {
    this.videoUrl = this.episode.videos[0];
    this.videoType = 'video/' + this.getExtname(this.videoUrl);
    this._autoHideTimer.subscribe(this._checkControlTimeout.bind(this));
    return null;
  }
}
