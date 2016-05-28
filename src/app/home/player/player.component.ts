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

  ngOnInit():any {
    this.videoUrl = this.episode.videos[0];
    return null;
  }
}
