import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouteConfig} from "@angular/router-deprecated";
import {DefaultComponent} from "./default/default.component";
import {HomeService} from './home.service';
import {PlayEpisode} from "./play-episode/play-episode.component";
import {BangumiDetail} from "./bangumi-detail/bangumi-detail.components";
import {BangumiList} from "./bangumi-list/bangumi-list.component";

require('./home.less');

@Component({
  selector: 'home',
  template: require('./home.html'),
  providers: [Title, HomeService, PlayEpisode]
})
@RouteConfig([
  {path: '/', name: 'Default', component: DefaultComponent, useAsDefault: true},
  {path: '/play/:episode_id', name: 'Play', component: PlayEpisode},
  {path: '/bangumi/:bangumi_id', name: 'Bangumi', component: BangumiDetail},
  {path: '/bangumi', name: 'BangumiList', component: BangumiList}
])
export class Home implements OnInit {

  siteTitle:string = SITE_TITLE;

  currentRouteName: string = '';

  sidebarActive: boolean = true;

  constructor(titleService:Title, homeService: HomeService) {
    titleService.setTitle(this.siteTitle);
    homeService.childRouteChanges.subscribe((routeName) => {
      if(routeName === 'Play') {
        this.sidebarActive = false;
      } else {
        this.sidebarActive = true;
      }
      this.currentRouteName = routeName;
    })
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  ngOnInit():any {

    return null;
  }

}
