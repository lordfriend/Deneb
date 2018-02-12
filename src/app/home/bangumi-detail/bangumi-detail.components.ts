import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HomeChild, HomeService } from "../home.service";
import { Bangumi, User } from "../../entity";
import { Observable, Subscription } from "rxjs/Rx";
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../user-service';
import { ChromeExtensionService } from '../../browser-extension/chrome-extension.service';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { AuthError } from '../../../helpers/error';


@Component({
    selector: 'view-bangumi-detail',
    templateUrl: './bangumi-detail.html',
    styleUrls: ['./bangumi-detail.less']
})
export class BangumiDetail extends HomeChild implements OnInit, OnDestroy {
    private _toastRef: UIToastRef<UIToastComponent>;
    private _subscription = new Subscription();
    private _coverExpanded = false;

    user: User;

    bangumi: Bangumi;

    orientation: 'landscape' | 'portrait';
    coverRevealerHeight: string;

    @ViewChild('bangumiCover') bangumiCoverRef: ElementRef;

    isExtraInfoEnabled = false;
    extraInfo: any;

    constructor(homeService: HomeService,
                userService: UserService,
                private _chromeExtensionService: ChromeExtensionService,
                private _dialog: UIDialog,
                private _route: ActivatedRoute,
                private _titleService: Title,
                private _changeDetector: ChangeDetectorRef,
                toast: UIToast) {
        super(homeService);
        this._toastRef = toast.makeText();
        this._subscription.add(
            userService.userInfo
                .subscribe(user => {
                    this.user = user;
                })
        );
    }

    toggleCover() {
        if (this._coverExpanded) {
            this.checkViewport();
        } else {
            this.coverRevealerHeight = (this.bangumiCoverRef.nativeElement.clientHeight - 14) + 'px';
        }
        this._coverExpanded = !this._coverExpanded;
    }

    reloadEpisodes() {
        this._subscription.add(
            this.homeService.bangumi_detail(this.bangumi.id)
                .subscribe(bangumi => {
                    this.bangumi.episodes = bangumi.episodes;
                    this._changeDetector.detectChanges();
                })
        );
    }

    ngOnInit(): void {
        this._subscription.add(
            this._route.params
                .flatMap((params) => {
                    return this.homeService.bangumi_detail(params['bangumi_id']);
                })
                .flatMap(bangumi => {
                    let bgmTitle = `${bangumi.name} - ${SITE_TITLE}`;
                    this._titleService.setTitle(bgmTitle);
                    this.bangumi = bangumi;
                    return this._chromeExtensionService.isEnabled
                })
                .do(isEnabled => {
                    this.isExtraInfoEnabled = isEnabled;
                })
                .filter(isEnabled => isEnabled)
                .flatMap(() => {
                    return this._chromeExtensionService.invokeBangumiMethod('bangumiDetail', [this.bangumi.bgm_id]);
                })
                .subscribe((extraInfo) => {
                    console.log(extraInfo);
                    this.extraInfo = extraInfo;
                }, (error) => {
                    console.log(error);
                    if (error instanceof AuthError && (error as AuthError).isPermission()) {
                        this._toastRef.show('没有权限');
                    } else {
                        this._toastRef.show(error.message);
                    }
                })
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
}
