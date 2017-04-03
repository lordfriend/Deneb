import {Bangumi} from '../../entity';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {AdminService} from '../admin.service';
import {BehaviorSubject, Subscription} from 'rxjs';

require('./list-bangumi.less');
export const CARD_HEIGHT_REM = 16;
@Component({
    selector: 'list-bangumi',
    templateUrl: './list-bangumi.html',
    providers: [AdminService]
})
export class ListBangumi implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _inputSubject = new BehaviorSubject<string>('');

    private _bangumiList: Bangumi[];

    name: string;

    currentPage: number = 1;

    total: number = 0;

    numberPerPage: number = 10;

    orderBy: string = 'create_time';
    sort: string = 'desc';

    set bangumiList(list: Bangumi[]) {
        this._bangumiList = list;
        this.timestampList = list.map((bangumi: Bangumi) => {
            if (this.orderBy === 'air_date') {
                return bangumi.air_date ? Date.parse(bangumi.air_date) : Date.now();
            }
            return bangumi[this.orderBy];
        });
        console.log(this.timestampList);
    };

    get bangumiList(): Bangumi[] {
        return this._bangumiList;
    };

    isLoading: boolean = false;

    cardHeight: number;
    timestampList: number[];

    constructor(private adminService: AdminService,
                private router: Router,
                titleService: Title) {
        titleService.setTitle('新番管理 - ' + SITE_TITLE);
        if (window) {
            this.cardHeight = CARD_HEIGHT_REM * parseFloat(window.getComputedStyle(document.body).getPropertyValue('font-size').match(/(\d+(?:\.\d+)?)px/)[1]);
        }
    }

    private loadBangumiList() {
        this.isLoading = true;
        this.adminService.listBangumi({
            page: this.currentPage,
            count: this.numberPerPage,
            orderBy: this.orderBy,
            sort: this.sort,
            name: this.name
        })
            .subscribe(
                (result: { data: Bangumi[], total: number }) => {
                    this.bangumiList = result.data;
                    this.total = result.total;
                    this.isLoading = false
                },
                (error: any) => {
                    this.isLoading = false
                },
            );
    }

    filterBangumi(name: string): void {
        this._inputSubject.next(name);
    }

    onPageChange(pageNumber: number) {
        this.currentPage = pageNumber;
        this.loadBangumiList();
    }

    ngOnInit(): void {
        this._subscription.add(
            this._inputSubject
                .debounceTime(500)
                .distinctUntilChanged()
                .flatMap((name: string) => {
                    this.isLoading = true;
                    this.currentPage = 1;
                    this.name = name;
                    let count;
                    if (name) {
                        count = this.numberPerPage;
                    } else {
                        count = -1;
                    }
                    return this.adminService.listBangumi({
                        page: this.currentPage,
                        count: count,
                        orderBy: this.orderBy,
                        sort: this.sort,
                        name: name
                    });
                })
                .subscribe(
                    (result: { data: Bangumi[], total: number }) => {
                        this.bangumiList = result.data;
                        this.total = result.total;
                        this.isLoading = false
                    },
                    (error) => {
                        this.isLoading = false
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    public editBangumi(bangumi: Bangumi): void {
        this.router.navigate(['/admin/bangumi', bangumi.id]);
    }

}
