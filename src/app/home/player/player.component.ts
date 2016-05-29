import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {Episode} from "../../entity/episode";

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

  onClickPlay() {
    let videoElement: HTMLVideoElement = this._videoElementRef.nativeElement;
    if(videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  private getExtname(url: string) {
    let parts = url.split('.');
    return parts[parts.length - 1];
  }

  ngOnInit():any {
    this.videoUrl = this.episode.videos[0];
    this.videoType = 'video/' + this.getExtname(this.videoUrl);
    return null;
  }
}
