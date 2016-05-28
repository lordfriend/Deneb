import {Component, Input, OnInit} from '@angular/core';
import {Episode} from "../../entity/episode";

let nextId = 0;

@Component({
  selector: 'player',
  template: require('./player.html')
})
export class Player implements OnInit {

  @Input()
  episode:Episode;

  playerId:string = 'videoPlayerId' + (nextId++);
  videoUrl: string;
  videoType: string;

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
