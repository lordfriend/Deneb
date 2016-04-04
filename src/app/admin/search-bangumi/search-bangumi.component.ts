import {Component, Output} from 'angular2/core';
import {BangumiService} from "../api";
import {Bangumi} from "../../entity";
// import {MdToolbar} from '@angular2-material/toolbar';

@Component({
  selector: 'search-bangumi',
  template: require('./search-bangumi.html'),
  providers: [BangumiService],
  // directives: [MdToolbar]
})
export class SearchBangumi {

  public bangumiList = [];

  constructor(
    private _bangumiApi: BangumiService
  ){}

  searchBangumi(name: string) {
    this._bangumiApi.searchBangumi(name)
  }

  addBangumi(bangumi: Bangumi) {

  }
}
