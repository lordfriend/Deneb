import {Component, Output} from '@angular/core';
import {Bangumi} from '../../entity';
import {Title} from '@angular/platform-browser';
import {Subject} from 'rxjs'
import {Router} from '@angular/router';
import {AdminService} from '../admin.service';

@Component({
  selector: 'search-bangumi',
  template: require('./search-bangumi.html'),
  providers: [AdminService]
})
export class SearchBangumi {

  public bangumiList = [];
  private _input = new Subject<string>();

  constructor(
    private router: Router,
    private adminService: AdminService,
    titleService: Title
  ){
    titleService.setTitle('添加新番 - ' + SITE_TITLE);
    this._input
      .debounceTime(500)
      .distinctUntilChanged()
      .forEach(name => {
        this.adminService.searchBangumi(name)
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
    this.router.navigate(['/admin/search', bangumi.bgm_id]);
  }
}
