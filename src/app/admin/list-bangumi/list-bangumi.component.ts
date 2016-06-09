import {Bangumi} from "../../entity";
import {BangumiService} from "../api";
import {OnInit, Component} from "@angular/core";
import {Title} from '@angular/platform-browser';
import {Router} from "@angular/router-deprecated";
import {Subject} from "rxjs/Rx";

@Component({
  selector: 'list-bangumi',
  template: require('./list-bangumi.html'),
  providers: [BangumiService]
})
export class ListBangumi implements OnInit {

  name: string;

  currentPage: number = 1;

  total: number = 0;

  numberPerPage: number = 10;

  bangumiList: Bangumi[];

  isLoading: boolean = false;

  private _input = new Subject<string>();

  constructor(
    private _bangumiApi: BangumiService,
    private _router: Router,
    titleService: Title
  ){
    titleService.setTitle('新番管理 - ' + SITE_TITLE);

    this._input
      .debounceTime(500)
      .distinctUntilChanged()
      .forEach(name => {
        this.isLoading = true;
        this.currentPage = 1;
        this._bangumiApi.listBangumi(this.currentPage, this.numberPerPage, name)
          .subscribe(
            (result: {data: Bangumi[], total: number}) => {
              this.bangumiList = result.data;
              this.total = result.total;
            },
            error => console.log(error),
            () => {this.isLoading = false}
          );
      });
  }

  private loadBangumiList() {
    this.isLoading = true;
    this._bangumiApi.listBangumi(this.currentPage, this.numberPerPage, this.name)
      .subscribe(
        (result: {data: Bangumi[], total: number}) => {
          this.bangumiList = result.data;
          this.total = result.total;
        },
        error => console.log(error),
        () => {this.isLoading = false}
      );
  }

  filterBangumi(name: string): void {
    this._input.next(name);
  }

  onPageChange(pageNumber: number) {
    this.currentPage = pageNumber;
    this.loadBangumiList();
  }

  ngOnInit():any {
    this.loadBangumiList();
    return undefined;
  }

  public editBangumi(bangumi: Bangumi):void {
    this._router.navigate(['EditBangumiDetail', {id: bangumi.id}]);
  }

}
