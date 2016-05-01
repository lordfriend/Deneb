import {Component} from 'angular2/core';
import {RouteConfig, OnActivate, ComponentInstruction} from "angular2/router";
import {SearchBangumi} from "./search-bangumi";
import {BangumiDetail} from "./bangumi-detail";
import {ListBangumi} from "./list-bangumi";
import {Authentication} from "../user-service";

require('./admin.scss');



@Component({
  selector: 'admin',
  template: require('./admin.html'),
  providers: [Authentication]
})
@RouteConfig([
  {path: '/search', name: 'SearchBangumi', component: SearchBangumi},
  {path: '/search/:bgm_id', name: 'BangumiDetail', component: BangumiDetail},
  {path: '/bangumi', name: 'ListBangumi', component: ListBangumi},
  {path: '/bangumi/:id', name: 'EditBangumiDetail', component: BangumiDetail}
])
export class Admin implements OnActivate {

  constructor(
    private _authentication: Authentication
  ) {}

  routerOnActivate(nextInstruction:ComponentInstruction, prevInstruction:ComponentInstruction):any|Promise<any> {
    return this._authentication.checkUserCredential(2)
      .then(
        () => { return true },
        (error) => { return error});
  }
}
