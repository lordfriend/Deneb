import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouteConfig} from "@angular/router-deprecated";
import {DefaultComponent} from "./default/default.component";
import {HomeService} from './home.service';
import {PlayEpisode} from "./play-episode/play-episode.component";
import {BangumiDetail} from "./bangumi-detail/bangumi-detail.components";
import {BangumiList} from "./bangumi-list/bangumi-list.component";
import {Observable, Subscription} from "rxjs/Rx";

require('./home.less');

const BREAK_POINT = 1330;

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
export class Home implements OnInit, OnDestroy {

  siteTitle:string = SITE_TITLE;

  currentRouteName: string = '';

  sidebarActive: boolean = false;

  sidebarOverlap: boolean = false;

  private _sidebarClickSubscription: Subscription;
  private _resizeSubscription: Subscription;

  constructor(titleService:Title, homeService: HomeService) {
    titleService.setTitle(this.siteTitle);
    homeService.childRouteChanges.subscribe((routeName) => {
      if(routeName === 'Play') {
        this.sidebarActive = false;
      } else if(!this.sidebarOverlap) {
        this.sidebarActive = true;
      }
      this.currentRouteName = routeName;
    })
  }

  toggleSidebar(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.sidebarActive = !this.sidebarActive;
  }

  private checkOverlapMode() {
    let viewportWidth =  window.innerWidth;
    if(viewportWidth <= BREAK_POINT) {
      this.sidebarOverlap = true;
    } else {
      this.sidebarOverlap = false;
    }
  }

  ngOnInit():any {
    this.checkOverlapMode();

    this._sidebarClickSubscription = Observable.fromEvent(document, 'click')
      .filter(() => {
        return this.sidebarOverlap && this.sidebarActive;
      })
      .subscribe(
        () => {
          this.sidebarActive = false;
        }
      );

    this._resizeSubscription = Observable.fromEvent(window, 'resize')
      .subscribe(
        () => {
          this.checkOverlapMode();
        }
      );

    return null;
  }


  ngOnDestroy():any {
    if(this._sidebarClickSubscription) {
      this._sidebarClickSubscription.unsubscribe();
    }
    return null;
  }
}
