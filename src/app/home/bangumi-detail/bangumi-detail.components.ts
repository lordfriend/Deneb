import {
    Component, OnInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import {HomeService, HomeChild} from "../home.service";
import {Bangumi} from "../../entity/bangumi";
import {Observable, Subscription} from "rxjs/Rx";
import {ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';
import { UserService } from '../../user-service/user.service';
import { User } from '../../entity/user';


@Component({
    selector: 'view-bangumi-detail',
    templateUrl: './bangumi-detail.html',
    styleUrls: ['./bangumi-detail.less']
})
export class BangumiDetail extends HomeChild implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _coverExpanded = false;

    user: User;

    bangumi: Bangumi;

    orientation: 'landscape' | 'portrait';
    coverRevealerHeight: string;

    @ViewChild('bangumiCover') bangumiCoverRef: ElementRef;

    constructor(homeService: HomeService,
                userService: UserService,
                private _route: ActivatedRoute,
                private _titleService: Title) {
        super(homeService);
        this._subscription.add(
            userService.userInfo
                .subscribe(user => {
                    this.user = user;
                })
        );
    }

    private checkViewport() {
        let viewportWidth = window.innerWidth;
        let viewportHeight = window.innerHeight;
        if (viewportWidth < 768) {
            this.orientation = 'portrait';
            this.coverRevealerHeight = Math.round(viewportHeight / 4) + 'px';
        } else {
            this.orientation = 'landscape';
            this.coverRevealerHeight = 0 + '';
        }
    }

    toggleCover() {
        if (this._coverExpanded) {
            this.checkViewport();
        } else {
            this.coverRevealerHeight = (this.bangumiCoverRef.nativeElement.clientHeight - 14) + 'px';
        }
        this._coverExpanded = !this._coverExpanded;
    }

    ngOnInit(): void {
        this._subscription.add(
            this._route.params
            .flatMap((params) => {
                return this.homeService.bangumi_datail(params['bangumi_id']);
            })
            .subscribe(
                (bangumi: Bangumi) => {
                    let bgmTitle = `${bangumi.name} - ${SITE_TITLE}`;
                    this._titleService.setTitle(bgmTitle);
                    this.bangumi = bangumi;
                },
                error => console.log(error)
            )
        );
        this.checkViewport();

        this._subscription.add(
            Observable.fromEvent(window, 'resize')
                .subscribe(
                    () => {
                        this.checkViewport();
                    }
                )
        );
    }


    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
