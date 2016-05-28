import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {BangumiService} from '../api';
import {Bangumi, Episode, BangumiRaw} from '../../entity';
import {RouteParams, Router} from "@angular/router-deprecated";
import {EpisodeDetail} from "./episode-detail/episode-detail.component";

@Component({
  selector: 'bangumi-detail',
  template: require('./bangumi-detail.html'),
  providers: [BangumiService],
  directives: [EpisodeDetail],
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

  bangumi: Bangumi = <Bangumi>{};

  episodeList: Episode[] = [];
  errorMessage: any;
  
  isSavingBangumi: boolean = false;

  private from: string;

  constructor(
    private _router: Router,
    private _routeParams: RouteParams,
    private _bangumiApi: BangumiService,
    private _titleService: Title
  ){}

  ngOnInit(): any {
    let id = this._routeParams.get('id');
    let bgm_id = Number(this._routeParams.get('bgm_id'));
    console.log(id);
    this.from = id ? 'list' : 'search';

    if(bgm_id) {
      this._titleService.setTitle('添加新番 - ' + SITE_TITLE);
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
      this._titleService.setTitle('编辑新番 - ' + SITE_TITLE);
      this._bangumiApi.getBangumi(id)
        .subscribe(
          (bangumi: Bangumi) => {
            this.bangumi = bangumi;
          },
          error => this.errorMessage = <any>error
        );
    }

    return undefined;
  }

  onSubmit(): void {
    this.isSavingBangumi = true;
    if(!this.bangumi.id) {
      this._bangumiApi.addBangumi(<BangumiRaw>this.bangumi)
        .subscribe(
          (id: string) => {
            this.isSavingBangumi = false;
            if(id) {
              this._router.navigate(['EditBangumiDetail', {id: id}]);
            } else {
              this.errorMessage = 'No id return';
            }
          },
          (error:any) => {
            this.errorMessage = <any>error;
            this.isSavingBangumi = false;
          }
        )
    } else {
      this._bangumiApi.updateBangumi(this.bangumi)
        .subscribe(
          result => {
            console.log(result);
            this.isSavingBangumi = false;
          },
          error => {
            this.errorMessage = <any> error;
            this.isSavingBangumi = false;
          }
        );
    }
  }

  back(): void {
    if(this.from === 'search') {
      this._router.navigate(['SearchBangumi']);
    } else if(this.from === 'list') {
      this._router.navigate(['ListBangumi']);
    }
  }

}
