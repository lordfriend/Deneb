import {Component, OnInit} from '@angular/core';
import {Episode, Bangumi} from "../../entity";
import {HomeService, HomeChild} from "../home.service";
import {RouteParams} from '@angular/router-deprecated';
import {Player} from "../player/player.component";

@Component({
  selector: 'play-episode',
  template: require('./play-episode.html'),
  directives: [Player]
})
export class PlayEpisode extends HomeChild implements OnInit {

  episode:Episode;

  constructor(
    homeService: HomeService,
    private _routeParams: RouteParams
  ){
    super(homeService);
  }

  ngOnInit():any {
    let episode_id = this._routeParams.get('episode_id');
    this.homeService.episode_detail(episode_id)
      .subscribe(
        (episode: Episode) => {
          this.episode = episode;
          this.homeService.bangumi_datail(episode.bangumi_id)
            .subscribe(
              (bangumi: Bangumi) => {
                this.episode.bangumi = bangumi
              },
              error => console.log(error)
            );
        },
        error => console.log(error)
      );
    return null;
  }
}
