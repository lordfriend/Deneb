import {Component, Output} from 'angular2/core';
import {BangumiService} from "../api";
import {Bangumi} from "../../entity";

@Component({
  selector: 'search-bangumi',
  template: require('./search-bangumi.html'),
  providers: [BangumiService]
})
export class SearchBangumi {

  public bangumiList = [];

  private searchValue = {
    name: ''
  };

  constructor(
    private _bangumiApi: BangumiService
  ){}

  searchBangumi(name: string) {
    if(name) {
      this._bangumiApi.searchBangumi(name)
        .subscribe(
          bangumiList => this.bangumiList = bangumiList,
          error => console.log(error)
        );
    }
  }

  addBangumi(bangumi: Bangumi) {

  }
}
