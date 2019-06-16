
import {interval as observableInterval,  Subscription ,  Observable } from 'rxjs';

import {map, take} from 'rxjs/operators';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HomeChild, HomeService } from '../home.service';
import { Bangumi } from '../../entity/bangumi';
import { ActivatedRoute } from '@angular/router';
import { BaseError } from '../../../helpers/error/BaseError';
import { InfiniteList, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { CARD_HEIGHT_REM } from '../bangumi-card/bangumi-card.component';
import { getRemPixel } from '../../../helpers/dom';
import { Home } from '../home.component';
import { BangumiListService } from './bangumi-list.service';
import { AuthError } from '../../../helpers/error';
import { FormGroup } from '@angular/forms';


@Component({
    selector: 'bangumi-list',
    templateUrl: './bangumi-list.html',
    styleUrls: ['./bangumi-list.less']
})
export class BangumiList extends HomeChild implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    private _allBangumi: Bangumi[];
    private _isMovie: boolean;

    name: string;

    isLoading = true;

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

    lastScrollPosition: number;

    get isMovie(): boolean {
        if (typeof this._bangumiListService.isMovie !== 'undefined') {
            return this._bangumiListService.isMovie;
        }
        return this._isMovie;
    }

    set isMovie(v: boolean) {
        this._isMovie = v;
        this._bangumiListService.isMovie = v;
        this.filterBangumi();
    }

    @ViewChild(InfiniteList) infiniteList: InfiniteList;

    constructor(homeService: HomeService,
                private _homeComponent: Home,
                private _route: ActivatedRoute,
                private _bangumiListService: BangumiListService,
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
                        if (this.infiniteList) {
                            setTimeout(() => {
                                this.infiniteList.requestMeasure();
                            });
                        }
                    }
                )
        );
        if (Number.isFinite(this._bangumiListService.scrollPosition)) {
            this.lastScrollPosition = this._bangumiListService.scrollPosition;
        }
        if (this._bangumiListService.sort) {
            this.sort = this._bangumiListService.sort;
        }
        if (Number.isInteger(this._bangumiListService.type)) {
            this.type = this._bangumiListService.type;
        }
    }

    onClickFilterContainer() {
        const step = 10;
        let totalDistance = this._bangumiListService.scrollPosition;
        const co = totalDistance / ((step - 1) * (step -1));
        this._subscription.add(
            observableInterval(30).pipe(
                take(step),
                map((t) => {
                    return Math.floor(totalDistance - co * t * t);
                }),)
                .subscribe((d) => {
                    this.lastScrollPosition = d;
                })
        );
    }

    onScrollPositionChange(p: number) {
        this._bangumiListService.scrollPosition = p;
    }

    loadFromServer() {
        this.isLoading = true;
        this._subscription.add(this.homeService
            .listBangumi({
                page: 1,
                count: -1,
                order_by: 'air_date',
                sort: 'desc'
            }).pipe(
            map((result) => result.data))
            .subscribe(
                (bangumiList) => {
                    this._allBangumi = bangumiList;
                    this.filterBangumi();
                    this.isLoading = false;
                },
                (error: BaseError) => {
                    if (error instanceof AuthError && (error as AuthError).isPermission()) {
                        this._toastRef.show('没有权限');
                    } else {
                        this._toastRef.show(error.message);
                    }
                    this.isLoading = false;
                }
            )
        );
    }

    filterBangumi() {
        this.bangumiList = this._allBangumi
            .filter(bangumi => {
                if (this.isMovie) {
                    return bangumi.eps === 1;
                }
                return true;
            })
            .filter(bangumi => {
                if (this.name) {
                    return Bangumi.containKeyword(bangumi, this.name);
                }
                return true;
            })
            .filter(bangumi => {
                if (this.type === -1) {
                    return true;
                }
                return bangumi.type === this.type;
            });
        if (this.sort !== 'desc') {
            this.bangumiList = this.bangumiList.reverse();
        }
        this.timestampList = this.bangumiList
            .map(bangumi => {
                return bangumi.air_date ? Date.parse(bangumi.air_date) : Date.now();
            });
    }

    onOrderChange(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.sort === 'desc') {
            this.sort = 'asc';
        } else {
            this.sort = 'desc';
        }
        this._bangumiListService.sort = this.sort;
        this.filterBangumi();
    }

    onTypeChange(type: number) {
        this.type = type;
        this._bangumiListService.type = this.type;
        this.filterBangumi();
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
}
