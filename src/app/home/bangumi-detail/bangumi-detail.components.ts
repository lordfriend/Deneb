import {Component, OnInit} from '@angular/core';
import {HomeService} from "../home.service";
import {Bangumi} from "../../entity/bangumi";
import {RouteParams} from "@angular/router-deprecated";

@Component({
  selector: 'view-bangumi-detail',
  template: require('./bangumi-detail.html')
})
export class BangumiDetail implements OnInit {

  bangumi:Bangumi = new Bangumi();

  constructor(
    private _homeService:HomeService,
    private _routeParams: RouteParams
  ) {}

  ngOnInit():any {
    let bangumi_id = this._routeParams.get('bangumi_id');
    this._homeService.bangumi_datail(bangumi_id)
      .subscribe(
        (bangumi: Bangumi) => {
          this.bangumi = bangumi;
        },
        error => console.log(error)
      );
    return null;
  }
}
