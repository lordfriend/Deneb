import {Component, OnInit, OnDestroy} from '@angular/core';
import {Episode, Bangumi} from "../../entity";
import {HomeService, HomeChild} from "../home.service";
import {Player} from "../player/player.component";
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Rx';

@Component({
  selector: 'play-episode',
  template: require('./play-episode.html'),
  directives: [Player]
})
export class PlayEpisode extends HomeChild implements OnInit, OnDestroy {

  episode:Episode;

  private routeParamsSubscription: Subscription;

  constructor(
    homeService: HomeService,
    private route: ActivatedRoute
  ){
    super(homeService);
  }

  ngOnInit():any {
    this.routeParamsSubscription = this.route.params
      .flatMap((params) => {
        let episode_id = params['episode_id'];
        return this.homeService.episode_detail(episode_id)
      })
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

  ngOnDestroy():any {
    this.routeParamsSubscription.unsubscribe();
    return null;
  }
}
