import {Component, OnInit} from '@angular/core';
import {HomeChild, HomeService} from "../home.service";
import {RouteParams} from "@angular/router-deprecated";
import {Bangumi} from "../../entity/bangumi";


@Component({
  selector: 'bangumi-list',
  template: require('./bangumi-list.html')
})
export class BangumiList extends HomeChild implements OnInit {

  page: number;
  name: string;

  bangumiList: Bangumi[];

  constructor(homeService:HomeService, private _routeParams: RouteParams) {
    super(homeService);
  }

  ngOnInit():any {
    this.page = parseInt(this._routeParams.get('page'));
    this.name = this._routeParams.get('name');

    this.homeService.listBangumi(this.page, this.name)
      .subscribe(
        (bangumiList: Bangumi[]) => {
          this.bangumiList = bangumiList;
        },
        (error) => {console.log(error)}
      );

    return null;
  }
}
