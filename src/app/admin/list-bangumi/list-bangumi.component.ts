import {Bangumi} from "../../entity";
import {OnInit, Component} from "@angular/core";
import {Title} from '@angular/platform-browser';
import {Router} from "@angular/router";
import {Subject} from "rxjs/Rx";
import {AdminService} from '../admin.service';

@Component({
  selector: 'list-bangumi',
  templateUrl: './list-bangumi.html',
  providers: [AdminService]
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
    private adminService: AdminService,
    private router: Router,
    titleService: Title
  ){
    titleService.setTitle('新番管理 - ' + SITE_TITLE);

    this._input
      .debounceTime(500)
      .distinctUntilChanged()
      .forEach(name => {
        this.isLoading = true;
        this.currentPage = 1;
        this.adminService.listBangumi(this.currentPage, this.numberPerPage, name)
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
    this.adminService.listBangumi(this.currentPage, this.numberPerPage, this.name)
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
    this.router.navigate(['/admin/bangumi', bangumi.id]);
  }

}
