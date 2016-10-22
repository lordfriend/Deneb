import {Component, OnInit, OnDestroy} from '@angular/core';
import {Episode, Bangumi} from "../../entity";
import {HomeService, HomeChild} from "../home.service";
import {ActivatedRoute} from '@angular/router';
import {Subscription, Subject} from 'rxjs/Rx';
import {Title} from '@angular/platform-browser';
import {WatchService} from '../watch.service';

export const MIN_WATCHED_PERCENTAGE = 0.95;


@Component({
  selector: 'play-episode',
  template: require('./play-episode.html')
})
export class PlayEpisode extends HomeChild implements OnInit, OnDestroy {

  episode: Episode;

  private routeParamsSubscription: Subscription;
  private positionChangeSubscription: Subscription;

  private positionChange: Subject<number> = new Subject<number>();

  constructor(homeService: HomeService,
              private watchService: WatchService,
              private titleService: Title,
              private route: ActivatedRoute) {
    super(homeService);
  }

  private current_position: number;
  private duration: number;
  private isUpdateHistory: boolean = false;

  private get isFinished(): boolean {
    if(typeof this.current_position === 'undefined' || typeof this.duration === 'undefined') {
      return false;
    }
    return this.current_position / this.duration >= MIN_WATCHED_PERCENTAGE;
  }

  onWatchPositionUpdate(position: number) {
    this.current_position = position;
    this.positionChange.next(position);
  }

  onDurationUpdate(duration: number) {
    this.duration = duration;
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

    this.positionChangeSubscription = this.positionChange
      .throttleTime(5000)
      .filter(() => {
        return !this.isUpdateHistory;
      })
      .subscribe(
        (position) => {
          this.isUpdateHistory = true;
          let percentage = position / this.duration;
          if(Number.isNaN(percentage)) {
            return;
          }
          this.watchService.episode_history(this.episode.bangumi_id, this.episode.id, position, percentage, this.isFinished)
            .subscribe(
              () => {
                this.isUpdateHistory = false;
              },
              () => {
                this.isUpdateHistory = false;
              }
            );
        },
        () => {}
      );
    return null;
  }

  ngOnDestroy(): any {
    this.routeParamsSubscription.unsubscribe();
    this.positionChangeSubscription.unsubscribe();
    return null;
  }
}
