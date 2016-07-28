import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {HomeService} from './home.service';
import {PlayEpisode} from "./play-episode/play-episode.component";
import {Observable, Subscription} from "rxjs/Rx";
import {Authentication} from '../user-service/authentication.service';
import {User} from '../entity';
import {Router, NavigationEnd} from '@angular/router';
import {UserService} from '../user-service/user.service';


require('./home.less');

const BREAK_POINT = 1330;

@Component({
  selector: 'home',
  template: require('./home.html'),
  providers: [Title, HomeService, PlayEpisode, Authentication]
})
export class Home implements OnInit, OnDestroy {

  siteTitle:string = SITE_TITLE;

  currentRouteName: string = '';

  sidebarActive: boolean = false;

  sidebarOverlap: boolean = false;

  user: User;

  private sidebarClickSubscription: Subscription;
  private resizeSubscription: Subscription;
  private userServiceSubscription: Subscription;

  constructor(titleService:Title, homeService: HomeService, private userService: UserService) {
    titleService.setTitle(this.siteTitle);
    homeService.childRouteChanges.subscribe((routeName) => {
      if(routeName === 'Play') {
        this.sidebarActive = false;
      } else if(!this.sidebarOverlap) {
        this.sidebarActive = true;
      }
      this.currentRouteName = routeName;
    });
  }

  toggleSidebar(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.sidebarActive = !this.sidebarActive;
  }

  private checkOverlapMode() {
    let viewportWidth =  window.innerWidth;
    this.sidebarOverlap = viewportWidth <= BREAK_POINT;
  }

  ngOnInit():any {
    this.userServiceSubscription = this.userService.getUserInfo()
      .subscribe(
        (user: User) => {
          this.user = user;
        }
      );

    this.checkOverlapMode();

    this.sidebarClickSubscription = Observable.fromEvent(document, 'click')
      .filter(() => {
        return this.sidebarOverlap && this.sidebarActive;
      })
      .subscribe(
        () => {
          this.sidebarActive = false;
        }
      );

    this.resizeSubscription = Observable.fromEvent(window, 'resize')
      .subscribe(
        () => {
          this.checkOverlapMode();
        }
      );

    return null;
  }


  ngOnDestroy():any {
    if(this.userServiceSubscription) {
      this.userServiceSubscription.unsubscribe();
    }
    if(this.sidebarClickSubscription) {
      this.sidebarClickSubscription.unsubscribe();
    }
    return null;
  }
}
