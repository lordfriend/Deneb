import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {HomeService} from './home.service';
import {Observable, Subscription, Subject} from "rxjs/Rx";
import {User} from '../entity';
import {UserService} from '../user-service/user.service';
import {Bangumi} from '../entity/bangumi';
import {Router} from '@angular/router';


require('./home.less');

const BREAK_POINT = 1330;

@Component({
  selector: 'home',
  template: require('./home.html')
})
export class Home implements OnInit, OnDestroy {

  siteTitle: string = SITE_TITLE;

  currentRouteName: string = '';

  sidebarActive: boolean = false;

  sidebarOverlap: boolean = false;

  user: User;

  myBangumiList: Bangumi[];

  showFloatSearchFrame: boolean;

  private sidebarClickSubscription: Subscription;
  private resizeSubscription: Subscription;
  private userServiceSubscription: Subscription;

  constructor(titleService: Title, private homeService: HomeService, private userService: UserService, private router: Router) {
    this.checkOverlapMode();
    homeService.childRouteChanges.subscribe((routeName) => {
      if (routeName === 'Play') {
        this.sidebarActive = false;
      } else if (!this.sidebarOverlap) {
        this.sidebarActive = true;
      }
      this.currentRouteName = routeName;

      if (routeName === 'Bangumi') {
        titleService.setTitle(`所有新番 - ${this.siteTitle}`);
      } else if (routeName === 'Default') {
        titleService.setTitle(this.siteTitle);
      }
    });
  }

  searchBangumi(name: string) {
    this.router.navigate(['/bangumi', {name: name}]);
  }

  toggleFloatSearchFrame() {
    this.showFloatSearchFrame = !this.showFloatSearchFrame;
  }

  toggleSidebar(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.sidebarActive = !this.sidebarActive;
  }

  private checkOverlapMode() {
    let viewportWidth = window.innerWidth;
    this.sidebarOverlap = viewportWidth <= BREAK_POINT;
  }

  private updateMyBangumi() {
    this.homeService.myBangumi()
      .subscribe(
        (myBangumiList: Bangumi[]) => {
          this.myBangumiList = myBangumiList;
        }
      );
  }

  ngOnInit(): any {
    this.userServiceSubscription = this.userService.getUserInfo()
      .subscribe(
        (user: User) => {
          this.user = user;
        }
      );

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

    this.homeService.watchProgressChanges.subscribe((bangumi_id) => {
      if (Array.isArray(this.myBangumiList)) {
        let bangumi = this.myBangumiList.find(bangumi => bangumi.id === bangumi_id);
        if (bangumi && bangumi.unwatched_count > 0) {
          bangumi.unwatched_count--;
        }
      }
    });

    this.updateMyBangumi();

    this.homeService.favoriteChanges.subscribe(() => {
      this.updateMyBangumi();
    });

    return null;
  }


  ngOnDestroy(): any {
    if (this.userServiceSubscription) {
      this.userServiceSubscription.unsubscribe();
    }
    if (this.sidebarClickSubscription) {
      this.sidebarClickSubscription.unsubscribe();
    }
    return null;
  }
}
