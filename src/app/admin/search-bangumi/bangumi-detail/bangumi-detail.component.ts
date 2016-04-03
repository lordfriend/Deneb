import {Component, Input, OnInit} from 'angular2/core';
import {BangumiService} from '../../api';
import {Bangumi} from '../../../entity';

@Component({
  selector: 'bangumi-detail',
  template: require('./bangumi-detail.html')
})
export class BangumiDetail implements OnInit {

  @Input
  public bgm_id: number;

  public bangumi: Bangumi;

  public errorMessage;

  constructor(
    private _bangumiApi: BangumiService
  ){}

  protected ngOnInit() {
    this._bangumiApi.queryBangumi(this.bgm_id)
      .subscribe(
        bangumi => this.bangumi = bangumi,
        error => this.errorMessage = <any>error
      );
  }

  public onSubmit() {

  }
}
