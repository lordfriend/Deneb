import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouteConfig, Router, OnActivate, ComponentInstruction} from "@angular/router-deprecated";
import {DefaultComponent} from "./default/default.component";
import {HomeService} from './home.service';
import {PlayEpisode} from "./play-episode/play-episode.component";
import {BangumiDetail} from "./bangumi-detail/bangumi-detail.components";

require('./home.less');

@Component({
  selector: 'home',
  template: require('./home.html'),
  providers: [Title, HomeService, PlayEpisode]
})
@RouteConfig([
  {path: '/', name: 'Default', component: DefaultComponent, useAsDefault: true},
  {path: '/play/:episode_id', name: 'Play', component: PlayEpisode},
  {path: '/bangumi/:bangumi_id', name: 'Bangumi', component: BangumiDetail}
])
export class Home implements OnInit {

  siteTitle:string = SITE_TITLE;

  currentRouteName: string = '';

  sidebarActive: boolean = true;

  constructor(titleService:Title, private _router: Router) {
    titleService.setTitle(this.siteTitle);
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  ngOnInit():any {
    this.currentRouteName = this._router.currentInstruction.component.routeName;
    return null;
  }

}
