import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { closest } from '../../../helpers/dom';
import { Bangumi } from '../../entity';
import { FAVORITE_LABEL } from '../../entity/constants';
import { HomeService } from '../home.service';

@Component({
    selector: 'my-bangumi',
    templateUrl: './my-bangumi.html',
    styleUrls: ['./my-bangumi.less']
})
export class MyBangumiComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _statusSubject = new BehaviorSubject<number>(Bangumi.WATCHING);

    myBangumiList: Bangumi[];

    favoriteLabel = FAVORITE_LABEL;

    get currentStatus(): number {
        return this._statusSubject.getValue();
    }

    constructor(private _homeService: HomeService) {
    }

    @HostListener('click', ['$event'])
    onHostClick(event: Event) {
        let parent = closest(event.target, '.favorite-item');
        if (!parent) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    changeStatus(status: number) {
        this._statusSubject.next(status);
    }

    ngOnInit(): void {
        this._subscription.add(
            this._homeService.watchProgressChanges.subscribe((bangumi_id) => {
                if (Array.isArray(this.myBangumiList)) {
                    let bangumi = this.myBangumiList.find(bangumi => bangumi.id === bangumi_id);
                    if (bangumi && bangumi.unwatched_count > 0) {
                        bangumi.unwatched_count--;
                    }
                }
            })
        );

        this._subscription.add(
            merge(
                this._homeService.favoriteChanges,
                this._statusSubject)
                .pipe(
                    mergeMap(() => {
                        return this._homeService.myBangumi(this.currentStatus)
                    }),)
                .subscribe((bangumiList) => {
                    // desc , sort by favorite_update_time and air_date
                    this.myBangumiList = bangumiList.sort((bgm1, bgm2) => {
                        if (bgm1.favorite_update_time === bgm2.favorite_update_time) {
                            let t1, t2;
                            t1 = bgm1.air_date ? Date.parse(bgm1.air_date).valueOf() : Date.now();
                            t2 = bgm2.air_date ? Date.parse(bgm2.air_date).valueOf() : Date.now();
                            return t2 - t1;
                        }
                        return bgm2.favorite_update_time - bgm1.favorite_update_time;
                    })
                })
        );

        this._subscription.add(
            this._homeService.favoriteChecked
                .subscribe((result) => {
                    let bangumi = this.myBangumiList.find(bangumi => bangumi.id === result.bangumi_id);
                    console.log(bangumi);
                    if (bangumi) {
                        bangumi.favorite_check_time = result.check_time;
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
