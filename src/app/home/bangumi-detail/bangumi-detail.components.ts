import {
    Component, OnInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { HomeService, HomeChild } from "../home.service";
import { Bangumi, User } from "../../entity";
import { Observable, Subscription } from "rxjs/Rx";
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../user-service';
import { ChromeExtensionService } from '../../browser-extension/chrome-extension.service';
import { EditReviewDialogComponent } from '../rating/edit-review-dialog/edit-review-dialog.component';
import { UIDialog } from 'deneb-ui';


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

    isExtraInfoEnabled = false;
    extraInfo: any;
    userFavoriteInfo: any;

    constructor(homeService: HomeService,
                userService: UserService,
                private _chromeExtensionService: ChromeExtensionService,
                private _dialog: UIDialog,
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

    onEditReview() {
        const dialogRef = this._dialog.open(EditReviewDialogComponent, {backdrop: true, stickyDialog: true});
        dialogRef.componentInstance.comment = this.userFavoriteInfo.comment;
        dialogRef.componentInstance.rating = this.userFavoriteInfo.rating;
        dialogRef.componentInstance.bangumi = this.bangumi;
        dialogRef.componentInstance.tags = Array.isArray(this.userFavoriteInfo.tags) ? this.userFavoriteInfo.tags.join(' '): '';
        dialogRef.componentInstance.interest = this.userFavoriteInfo.status ? this.userFavoriteInfo.status.id : 0;
        this._subscription.add(dialogRef.afterClosed()
            .filter(result => !!result)
            .subscribe((result) => {
                this.userFavoriteInfo.rating = result.rating;
                this.userFavoriteInfo.comment = result.comment;
            }));
    }

    ngOnInit(): void {
        this._subscription.add(
            this._route.params
                .flatMap((params) => {
                    return this.homeService.bangumi_datail(params['bangumi_id']);
                })
                .subscribe((bangumi: Bangumi) => {
                        let bgmTitle = `${bangumi.name} - ${SITE_TITLE}`;
                        this._titleService.setTitle(bgmTitle);
                        this.bangumi = bangumi;
                        this._chromeExtensionService.isEnabled
                            .then((isEnabled) => {
                                this.isExtraInfoEnabled = isEnabled;
                                this._chromeExtensionService.invokeBangumiMethod('bangumiDetail', [this.bangumi.bgm_id])
                                    .then((extraInfo) => {
                                        this.extraInfo = extraInfo;
                                    }, (error) => {
                                        console.log(error);
                                    });
                                this._chromeExtensionService.invokeBangumiMethod('favoriteStatus', [this.bangumi.bgm_id])
                                    .then(data => {
                                        if (!data.code) {
                                            this.userFavoriteInfo = data;
                                        }
                                        console.log(data);
                                    }, (error) => {
                                        console.log(error);
                                    });
                            });
                    }
                    , error => console.log(error)
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
