import {Bangumi} from "../../entity";
import {BangumiService} from "../api";
import {OnInit, Component} from "@angular/core";
import {Router} from "@angular/router-deprecated";

@Component({
  selector: 'list-bangumi',
  template: require('./list-bangumi.html'),
  providers: [BangumiService]
})
export class ListBangumi implements OnInit {

  public name: string;

  public currentPage: number = 1;

  public total: number = 0;

  public numberPerPage: number = 20;

  public bangumiList: Bangumi[];

  constructor(
    private _bangumiApi: BangumiService,
    private _router: Router
  ){}

  public filterBangumi(): void {
    this._bangumiApi.listBangumi(this.currentPage, this.numberPerPage, this.name)
      .subscribe(
        (result: {data: Bangumi[], total: number}) => {
          this.bangumiList = result.data;
          this.total = result.total;
        },
        error => console.log(error)
      );
  }

  ngOnInit():any {
    this.filterBangumi();
    return undefined;
  }

  public editBangumi(bangumi: Bangumi):void {
    this._router.navigate(['EditBangumiDetail', {id: bangumi.id}]);
  }

}
