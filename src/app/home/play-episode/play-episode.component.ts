import {Component, OnInit} from '@angular/core';
import {Episode} from "../../entity/episode";
import {HomeService} from "../home.service";
import {RouteParams} from '@angular/router-deprecated';
import {Player} from "../player/player.component";

@Component({
  selector: 'play-episode',
  template: require('./play-episode.html'),
  directives: [Player]
})
export class PlayEpisode implements OnInit {

  episode:Episode;

  constructor(
    private _homeService: HomeService,
    private _routeParams: RouteParams
  ){}

  ngOnInit():any {
    let episode_id = this._routeParams.get('episode_id');
    this._homeService.episode_detail(episode_id)
      .subscribe(
        (episode: Episode) => {
          this.episode = episode;
        },
        error => console.log(error)
      );
    return null;
  }
}