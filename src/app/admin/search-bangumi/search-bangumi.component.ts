import {Component, Output} from '@angular/core';
import {BangumiService} from "../api";
import {Bangumi} from "../../entity";
import {Router} from "@angular/router-deprecated";

@Component({
  selector: 'search-bangumi',
  template: require('./search-bangumi.html'),
  providers: [BangumiService]
})
export class SearchBangumi {

  public bangumiList = [];

  constructor(
    private _router: Router,
    private _bangumiApi: BangumiService
  ){}

  searchBangumi(name: string):void {
    if(name) {
      this._bangumiApi.searchBangumi(name)
        .subscribe(
          bangumiList => this.bangumiList = bangumiList,
          error => console.log(error)
        );
    }
  }

  addBangumi(bangumi: Bangumi):void {
    if(bangumi.id) {
      return;
    }
    this._router.navigate(['BangumiDetail', {bgm_id: bangumi.bgm_id}]);
  }
}
