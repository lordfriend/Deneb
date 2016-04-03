import {Component, Output} from 'angular2/core';
import {BangumiService} from "../api";
import {Bangumi} from "../../entity";

@Component({
  selector: 'search-bangumi',
  template: require('./search-bangumi.html')
})
export class searchBangumi {

  @Output
  public bangumiList = [];

  @Output
  public selectedBangumi;

  constructor(
    private _bangumiApi: BangumiService
  ){}

  searchBangumi(name: string) {
    this._bangumiApi.searchBangumi(name)
  }

  addBangumi(bangumi: Bangumi) {

  }
}
