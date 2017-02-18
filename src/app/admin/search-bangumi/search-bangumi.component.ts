import {Component, Output} from '@angular/core';
import {Bangumi} from '../../entity';
import {Title} from '@angular/platform-browser';
import {Subject} from 'rxjs'
import {Router} from '@angular/router';
import {AdminService} from '../admin.service';

@Component({
  selector: 'search-bangumi',
  templateUrl: './search-bangumi.html',
  providers: [AdminService]
})
export class SearchBangumi {

  private _input = new Subject<string>();
  private _bangumiType: number = 2;
  bangumiList = [];
  isLoading: boolean = false;

  get bangumiType(): number {
    return this._bangumiType;
  }

  set bangumiType(type: number) {
    if (type != this._bangumiType) {
      this.bangumiList = [];
    }
    this._bangumiType = type;
  }

  constructor(
    private router: Router,
    private adminService: AdminService,
    titleService: Title
  ){
    titleService.setTitle('添加新番 - ' + SITE_TITLE);
    this._input
      .debounceTime(500)
      .distinctUntilChanged()
      .filter(name => !!name)
      .forEach(name => {
        this.isLoading = true;
        this.adminService.searchBangumi(name, this.bangumiType)
          .subscribe(
            bangumiList => this.bangumiList = bangumiList,
            error => console.log(error),
            () => this.isLoading = false
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
