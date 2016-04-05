import {Component} from 'angular2/core';
import {RouteConfig} from "angular2/router";
import {SearchBangumi} from "./search-bangumi";
import {BangumiDetail} from "./search-bangumi/bangumi-detail";

require('./admin.scss');

@Component({
  selector: 'admin',
  template: require('./admin.html')
})
@RouteConfig([
  {path: '/search', name: 'SearchBangumi', component: SearchBangumi},
  {path: '/search/:id', name: 'BangumiDetail', component: BangumiDetail}
])
export class Admin {

}
