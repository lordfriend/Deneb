import {Component, OnInit, OnDestroy} from '@angular/core';
import {Episode, Bangumi} from "../../entity";
import {HomeService, HomeChild} from "../home.service";
import {Player} from "../player/player.component";
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'play-episode',
  template: require('./play-episode.html'),
  directives: [Player]
})
export class PlayEpisode extends HomeChild implements OnInit, OnDestroy {

  episode: Episode;

  private routeParamsSubscription: Subscription;

  constructor(homeService: HomeService,
              private titleService: Title,
              private route: ActivatedRoute) {
    super(homeService);
  }

  ngOnInit(): any {
    this.routeParamsSubscription = this.route.params
      .flatMap((params) => {
        let episode_id = params['episode_id'];
        return this.homeService.episode_detail(episode_id)
      })
      .flatMap((episode: Episode) => {
        this.episode = episode;
        return this.homeService.bangumi_datail(episode.bangumi_id);
      })
      .subscribe(
        (bangumi: Bangumi) => {
          this.episode.bangumi = bangumi;
          let epsTitle = `${this.episode.bangumi.name} ${this.episode.episode_no} - ${SITE_TITLE}`;
          this.titleService.setTitle(epsTitle);
        },
        error => console.log(error)
      );

    return null;
  }

  ngOnDestroy(): any {
    this.routeParamsSubscription.unsubscribe();
    return null;
  }
}
