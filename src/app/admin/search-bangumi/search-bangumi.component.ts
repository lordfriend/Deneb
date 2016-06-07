import {Component, Output} from '@angular/core';
import {BangumiService} from '../api';
import {Bangumi} from '../../entity';
import {Router} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';
import {Subject} from 'rxjs'

@Component({
  selector: 'search-bangumi',
  template: require('./search-bangumi.html'),
  providers: [BangumiService]
})
export class SearchBangumi {

  public bangumiList = [];
  private _input = new Subject<string>();

  constructor(
    private _router: Router,
    private _bangumiApi: BangumiService,
    titleService: Title
  ){
    titleService.setTitle('添加新番 - ' + SITE_TITLE);
    this._input
      .debounceTime(500)
      .distinctUntilChanged()
      .forEach(name => {
        this._bangumiApi.searchBangumi(name)
          .subscribe(
            bangumiList => this.bangumiList = bangumiList,
            error => console.log(error)
          );
      });
  }

  searchBangumi(name: string):void {
    this._input.next(name)
  }

  addBangumi(bangumi: Bangumi):void {
    if(bangumi.id) {
      return;
    }
    this._router.navigate(['BangumiDetail', {bgm_id: bangumi.bgm_id}]);
  }
}
