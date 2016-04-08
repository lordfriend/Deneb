import {Component, OnInit} from 'angular2/core';
import {BangumiService} from '../api';
import {Bangumi, Episode, BangumiRaw} from '../../entity';
import {RouteParams, Router} from "angular2/router";

@Component({
  selector: 'bangumi-detail',
  template: require('./bangumi-detail.html'),
  providers: [BangumiService],
  styles:[`
    .bangumi-image {
      margin-right: 20px;
      margin-bottom: 30px;
    }
    .bangumi-image > img {
      width: 100%;
    }
  `]
})
export class BangumiDetail implements OnInit {

  public bangumi: Bangumi = <Bangumi>{};

  public episodeList: Episode[] = [];

  public errorMessage;

  private from;

  constructor(
    private _router: Router,
    private _routeParams: RouteParams,
    private _bangumiApi: BangumiService
  ){}

  ngOnInit() {
    let id = this._routeParams.get('id');
    let bgm_id = Number(this._routeParams.get('bgm_id'));
    console.log(id);
    this.from = id ? 'list' : 'search';

    if(bgm_id) {
      this._bangumiApi.queryBangumi(bgm_id)
        .subscribe(
          (bangumiRaw: BangumiRaw) => {
            console.log(bangumiRaw);
            this.bangumi = bangumiRaw;
            if(Array.isArray(bangumiRaw.episodes) && bangumiRaw.episodes.length > 0) {
              this.episodeList = bangumiRaw.episodes;
            }
          },
          error => this.errorMessage = <any>error
        );
    } else if(id) {

    }

  }

  public onSubmit() {
    if(!this.bangumi.id) {
      // add bangumi
      this._bangumiApi.addBangumi(<BangumiRaw>this.bangumi)
        .subscribe(
          (id: string) => {
            if(id) {
              this._router.navigate(['EditBangumiDetail', {id: id}]);
            } else {
              this.errorMessage = 'No id return';
            }
          },
          error => this.errorMessage = <any>error
        )
    }
  }

  public back() {
    if(this.from === 'search') {
      this._router.navigate(['SearchBangumi']);
    }
  }
}
