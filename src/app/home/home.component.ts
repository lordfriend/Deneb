import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouteConfig} from "@angular/router-deprecated";
import {DefaultComponent} from "./default/default.component";
import {HomeService} from './home.service';
import {PlayEpisode} from "./play-episode/play-episode.component";

require('./home.less');

@Component({
  selector: 'home',
  template: require('./home.html'),
  providers: [Title, HomeService, PlayEpisode]
})
@RouteConfig([
  {path: '/', name: 'Default', component: DefaultComponent, useAsDefault: true},
  {path: '/play/:episode_id', name: 'Play', component: PlayEpisode}
])
export class Home implements OnInit {

  siteTitle:string = SITE_TITLE;

  constructor(
    titleService: Title
  ) {
    titleService.setTitle(this.siteTitle);
  }

  ngOnInit():any {
    return null;
  }
}
