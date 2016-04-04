import {Component, Input, OnInit} from 'angular2/core';
import {BangumiService} from '../../api';
import {Bangumi} from '../../../entity';

@Component({
  selector: 'bangumi-detail',
  template: require('./bangumi-detail.html'),
  providers: [BangumiService]
})
export class BangumiDetail implements OnInit {

  public bgm_id: number;

  public bangumi: Bangumi;

  public errorMessage;

  constructor(
    private _bangumiApi: BangumiService
  ){}

  ngOnInit() {
    this._bangumiApi.queryBangumi(this.bgm_id)
      .subscribe(
        bangumi => this.bangumi = bangumi,
        error => this.errorMessage = <any>error
      );
  }

  public onSubmit() {

  }
}
