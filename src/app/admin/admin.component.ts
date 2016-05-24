import {Component} from '@angular/core';
import {RouteConfig} from "@angular/router-deprecated";
import {SearchBangumi} from "./search-bangumi";
import {BangumiDetail} from "./bangumi-detail";
import {ListBangumi} from "./list-bangumi";

require('./admin.less');



@Component({
  selector: 'admin',
  template: require('./admin.html'),
  providers: []
})
@RouteConfig([
  {path: '/search', name: 'SearchBangumi', component: SearchBangumi},
  {path: '/search/:bgm_id', name: 'BangumiDetail', component: BangumiDetail},
  {path: '/bangumi', name: 'ListBangumi', component: ListBangumi},
  {path: '/bangumi/:id', name: 'EditBangumiDetail', component: BangumiDetail}
])
export class Admin {

}
