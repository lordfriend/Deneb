import {Component} from 'angular2/core';
import {RouteConfig} from "angular2/router";
import {SearchBangumi} from "./search-bangumi";
import {BangumiDetail} from "./bangumi-detail";
import {ListBangumi} from "./list-bangumi";

require('./admin.scss');

@Component({
  selector: 'admin',
  template: require('./admin.html')
})
@RouteConfig([
  {path: '/search', name: 'SearchBangumi', component: SearchBangumi},
  {path: '/search/:bgm_id', name: 'BangumiDetail', component: BangumiDetail},
  {path: '/bangumi', name: 'ListBangumi', component: ListBangumi},
  {path: '/bangumi/:id', name: 'EditBangumiDetail', component: BangumiDetail}
])
export class Admin {
  
}
