import {Component, ElementRef, Host, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HomeChild, HomeService} from '../home.service';
import {Bangumi} from '../../entity/bangumi';
import {Subscription} from 'rxjs/Rx';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseError} from '../../../helpers/error/BaseError';
import {InfiniteList, UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {CARD_HEIGHT_REM} from '../bangumi-card/bangumi-card.component';
import {getRemPixel} from '../../../helpers/dom';
import {Home} from '../home.component';


@Component({
    selector: 'bangumi-list',
    templateUrl: './bangumi-list.html',
    styleUrls: ['./bangumi-list.less']
})
export class BangumiList extends HomeChild implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    private _allBangumi: Bangumi[];

    name: string;

    isLoading = false;

    sort = 'desc';
    type = -1;

    bangumiList: Bangumi[] = [];

    typeMenuLabel = {
        '-1': '全部',
        '2': '动画',
        '6': '电视剧'
    };

    cardHeight: number;
    timestampList: number[];

    @ViewChild(InfiniteList) infiniteList: InfiniteList;

    constructor(homeService: HomeService,
                private _homeComponent: Home,
                private _route: ActivatedRoute,
                toastService: UIToast) {
        super(homeService);
        this._toastRef = toastService.makeText();
        if (window) {
            this.cardHeight = getRemPixel(CARD_HEIGHT_REM)
        }
        this._subscription.add(
            _homeComponent.sidebarToggle
                .subscribe(
                    () => {
                        console.log('sidebar toggle');
                        if (this.infiniteList) {
                            setTimeout(() => {
                                this.infiniteList.requestMeasure();
                            });
                        }
                    }
                )
        );
    }

    ngOnInit(): void {
        this._subscription.add(
            this._route.params
                .subscribe((params) => {
                    this.name = params['name'];
                    if (!this._allBangumi) {
                        this.loadFromServer();
                    } else {
                        this.filterBangumi();
                    }
                })
        );
    }


    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    loadFromServer() {
        this.isLoading = true;
        this._subscription.add(this.homeService
            .listBangumi({
                page: 1,
                count: -1,
                order_by: 'air_date',
                sort: this.sort
            })
            .map((result) => result.data)
            .subscribe(
                (bangumiList) => {
                    this.isLoading = false;
                    this._allBangumi = bangumiList;
                    this.filterBangumi();
                },
                (error: BaseError) => {
                    this._toastRef.show(error.message);
                }
            )
        );
    }

    filterBangumi() {
        this.bangumiList = this._allBangumi
            .filter(bangumi => {
                if (this.name) {
                    return this.bangumiContainKeyword(bangumi, this.name);
                }
                return true;
            })
            .filter(bangumi => {
                if (this.type === -1) {
                    return true;
                }
                return bangumi.type === this.type;
            });
        this.timestampList = this._allBangumi
            .filter(bangumi => {
                if (this.type === -1) {
                    return true;
                }
                return bangumi.type === this.type;
            })
            .map(bangumi => {
                return bangumi.air_date ? Date.parse(bangumi.air_date) : Date.now();
            });
        if (this.sort !== 'desc') {
            this.bangumiList = this.bangumiList.reverse();
            this.timestampList = this.timestampList.reverse();
        }
    }

    bangumiContainKeyword(bangumi: Bangumi, name: string): boolean {
        let keywords = name.split(' ');
        if (keywords.length === 1 && !keywords[0]) {
            return (bangumi.name && bangumi.name.indexOf(name) !== -1)
                || (bangumi.name_cn && bangumi.name_cn.indexOf(name) !== -1)
                || (bangumi.summary && bangumi.summary.indexOf(name) !== -1);
        }
        return (bangumi.name && keywords.every(k => bangumi.name.indexOf(k) !== -1))
            || (bangumi.name_cn && keywords.every(k => bangumi.name_cn.indexOf(k) !== -1))
            || (bangumi.summary && keywords.every(k => bangumi.summary.indexOf(k) !== -1));
    }

    onOrderChange() {
        if (this.sort === 'desc') {
            this.sort = 'asc';
        } else {
            this.sort = 'desc';
        }
        this.filterBangumi();
    }

    onTypeChange(type: number) {
        this.type = type;
        this.filterBangumi();
    }
}
