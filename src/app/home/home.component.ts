import {Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {HomeService} from './home.service';
import {Observable, Subscription, Subject} from "rxjs/Rx";
import {User} from '../entity';
import {UserService} from '../user-service/user.service';
import {Bangumi} from '../entity/bangumi';
import {Router} from '@angular/router';

const BREAK_POINT = 1330;

@Component({
    selector: 'home',
    templateUrl: './home.html',
    styleUrls: ['./home.less']
})
export class Home implements OnInit, OnDestroy {

    private _subscription = new Subscription();

    siteTitle: string = SITE_TITLE;

    currentRouteName: string = '';

    sidebarActive: boolean = false;

    sidebarOverlap: boolean = false;

    user: User;

    myBangumiList: Bangumi[];

    showFloatSearchFrame: boolean;

    sidebarToggle = new EventEmitter<boolean>();

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
        this.sidebarToggle.emit(this.sidebarActive);
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

    ngOnInit(): void {
        this._subscription.add(this.userService.getUserInfo()
            .subscribe(
                (user: User) => {
                    this.user = user;
                }
            ));

        this._subscription.add(Observable.fromEvent(document, 'click')
            .filter(() => {
                return this.sidebarOverlap && this.sidebarActive;
            })
            .subscribe(
                () => {
                    this.sidebarActive = false;
                }
            ));

        this._subscription.add(Observable.fromEvent(window, 'resize')
            .subscribe(
                () => {
                    this.checkOverlapMode();
                }
            ));

        this._subscription.add(
            this.homeService.watchProgressChanges.subscribe((bangumi_id) => {
                if (Array.isArray(this.myBangumiList)) {
                    let bangumi = this.myBangumiList.find(bangumi => bangumi.id === bangumi_id);
                    if (bangumi && bangumi.unwatched_count > 0) {
                        bangumi.unwatched_count--;
                    }
                }
            })
        );

        this.updateMyBangumi();

        this._subscription.add(this.homeService.favoriteChanges.subscribe(() => {
            this.updateMyBangumi();
        }));
    }


    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
