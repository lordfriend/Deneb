import {Component, Input, OnInit} from 'angular2/core';
import {BangumiService} from '../api';
import {Bangumi} from '../../entity';
import {RouteParams} from "angular2/router";

@Component({
  selector: 'bangumi-detail',
  template: require('./bangumi-detail.html'),
  providers: [BangumiService]
})
export class BangumiDetail implements OnInit {

  public bangumi: Bangumi;

  public errorMessage;

  constructor(
    private _routeParams: RouteParams,
    private _bangumiApi: BangumiService
  ){}

  ngOnInit() {
    let id = this._routeParams.get('id');
    let bgm_id = Number(this._routeParams.get('bgm_id'));
    if(bgm_id) {
      this._bangumiApi.queryBangumi(bgm_id)
        .subscribe(
          bangumiRaw => console.log(bangumiRaw),
          error => this.errorMessage = <any>error
        );
    } else if(id) {

    }

  }

  public onSubmit() {

  }
}
