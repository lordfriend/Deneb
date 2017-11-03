import {Bangumi} from '../../entity';
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {AdminService} from '../admin.service';
import {Observable, Subscription} from 'rxjs';
import {getRemPixel} from '../../../helpers/dom';
import {UIDialog, UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {BaseError} from '../../../helpers/error/BaseError';
import {CARD_HEIGHT_REM} from '../bangumi-card/bangumi-card.component';
import {SearchBangumi} from '../search-bangumi/search-bangumi.component';
import { ListBangumiService } from './list-bangumi.service';

@Component({
    selector: 'list-bangumi',
    templateUrl: './list-bangumi.html',
    styleUrls: ['./list-bangumi.less']
})
export class ListBangumi implements AfterViewInit, OnDestroy, OnInit {
    private _subscription = new Subscription();

    private _bangumiList: Bangumi[];
    private _allBangumiList: Bangumi[];
    private _toastRef: UIToastRef<UIToastComponent>;

    @ViewChild('searchBox') searchBox: ElementRef;

    name: string;
    total: number = 0;
    orderBy: string = 'create_time';
    sort: string = 'desc';
    type: number = -1;

    orderByMenuLabel = {
        create_time: '按创建时间',
        update_time: '按修改时间',
        air_date: '按开播日期'
    };

    typeMenuLabel = {
        '-1': '全部',
        '2': '动画',
        '6': '电视剧'
    };

    set bangumiList(list: Bangumi[]) {
        this._bangumiList = list;
        this.timestampList = list.map((bangumi: Bangumi) => {
            if (this.orderBy === 'air_date') {
                return bangumi.air_date ? Date.parse(bangumi.air_date) : Date.now();
            }
            return bangumi[this.orderBy];
        });
    };

    get bangumiList(): Bangumi[] {
        return this._bangumiList;
    };

    isLoading: boolean = false;

    cardHeight: number;
    timestampList: number[];

    lastScrollPosition: number;

    constructor(private adminService: AdminService,
                private router: Router,
                private _dialog: UIDialog,
                private _listBangumiService: ListBangumiService,
                toastService: UIToast,
                titleService: Title) {
        titleService.setTitle('新番管理 - ' + SITE_TITLE);
        this._toastRef = toastService.makeText();
        if (window) {
            this.cardHeight = getRemPixel(CARD_HEIGHT_REM)
        }
        if (Number.isFinite(this._listBangumiService.scrollPosition)) {
            this.lastScrollPosition = this._listBangumiService.scrollPosition;
        }
        if (this._listBangumiService.sort) {
            this.sort = this._listBangumiService.sort;
        }
        if (this._listBangumiService.orderBy) {
            this.orderBy = this._listBangumiService.orderBy;
        }
        if (Number.isInteger(this._listBangumiService.type)) {
            this.type = this._listBangumiService.type;
        }
    }

    onScrollPositionChange(p: number) {
        this._listBangumiService.scrollPosition = p;
    }

    onOrderChange(orderBy: string, isSortChange: boolean) {
        this.orderBy = orderBy;
        if (isSortChange) {
            this.sort = this.sort === 'desc' ? 'asc' : 'desc';
        }
        this._listBangumiService.orderBy = this.orderBy;
        this._listBangumiService.sort = this.sort;
        this.filterBangumiList();
    }

    onTypeChange(type: number) {
        this.type = type;
        this._listBangumiService.type = this.type;
        this.filterBangumiList();
    }

    addBangumi(): void {
        let dialogRef = this._dialog.open(SearchBangumi, {stickyDialog: true, backdrop: true});
        this._subscription.add(
            dialogRef.afterClosed()
                .subscribe(
                    (result: any) => {
                        console.log(result);
                        if (result === 'cancelled') {
                            return;
                        }

                        this.router.navigate(['/admin/bangumi', result as string]);
                    }
                )
        );
    }

    ngOnInit(): void {
        this.loadFromServer();
    }

    ngAfterViewInit(): void {
        let searchBox = this.searchBox.nativeElement;
        this._subscription.add(
            Observable.fromEvent(searchBox, 'keyup')
                .debounceTime(500)
                .distinctUntilChanged()
                .subscribe(() => {
                    this.name = searchBox.value;
                    this.filterBangumiList();
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private loadFromServer() {
        this.isLoading = true;
        this._subscription.add(
            this.adminService
                .listBangumi({
                    page: 1,
                    count: -1,
                    order_by: this.orderBy,
                    sort: this.sort,
                    type: this.type
                })
                .subscribe(
                    (result: { data: Bangumi[], total: number }) => {
                        this._allBangumiList = result.data;
                        this.bangumiList = this._allBangumiList;
                        this.total = result.total;
                        this.isLoading = false
                    },
                    (error: BaseError) => {
                        console.log(error);
                        this._toastRef.show(error.message);
                        this.isLoading = false
                    }
                )
        );
    }

    public editBangumi(bangumi: Bangumi): void {
        this.router.navigate(['/admin/bangumi', bangumi.id]);
    }

    private filterBangumiList() {
        if (!this._allBangumiList) {
            return;
        }
        this.bangumiList = this._allBangumiList
            .filter(bangumi => {
                if (this.type === -1) {
                    return true;
                }
                return bangumi.type === this.type;
            })
            .filter(bangumi => {
                if (this.name) {
                    return Bangumi.containKeyword(bangumi, this.name);
                }
                return true;
            })
            .sort((bgm1: Bangumi, bgm2: Bangumi) => {
                let t1, t2;
                if (this.orderBy === 'air_date') {
                    t1 = bgm1.air_date ? Date.parse(bgm1.air_date).valueOf() : Date.now();
                    t2 = bgm2.air_date ? Date.parse(bgm2.air_date).valueOf() : Date.now();
                } else {
                    t1 = bgm1[this.orderBy];
                    t2 = bgm2[this.orderBy];
                }
                return this.sort === 'asc' ? t1 - t2 : t2 - t1;
            });
    }

}
