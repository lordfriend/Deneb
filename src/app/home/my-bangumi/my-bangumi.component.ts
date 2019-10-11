import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { filter } from 'rxjs/internal/operators';
import { mergeMap } from 'rxjs/operators';
import { closest } from '../../../helpers/dom';
import { Bangumi } from '../../entity';
import { FAVORITE_LABEL } from '../../entity/constants';
import { WatchProgress } from '../../entity/watch-progress';
import { VideoPlayerService } from '../../video-player/video-player.service';
import { FavoriteManagerService } from '../favorite-manager.service';
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

    constructor(private _homeService: HomeService,
                private _favoriteManager: FavoriteManagerService,
                private _videoPlayerService: VideoPlayerService) {
        this.myBangumiList = [];
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
            this._videoPlayerService.onWatchStatusChanges
                .pipe(filter(episode => {
                    return episode.watch_progress
                        && (episode.watch_progress.watch_status === WatchProgress.WATCHED
                            || episode.watch_progress.watch_status === WatchProgress.WATCHING);
                }))
                .subscribe(episode => {
                    let bangumi = this.myBangumiList.find(bangumi => bangumi.id === episode.bangumi_id);
                    if (bangumi && bangumi.unwatched_count > 0) {
                        bangumi.unwatched_count--;
                    }
                })
        );

        /**
         * We update my-bangumi list without refetch the resource from server due to the delay of refreshed data.
         * sometimes, this method is executed before the write operation is done at the backend.
         */
        this._subscription.add(
            this._favoriteManager.favoriteChanged
                .subscribe(bangumi => {
                    const bangumiList = this.myBangumiList;
                    let found = false;
                    for (let i = 0; i < bangumiList.length; i++) {
                        if (bangumiList[i].id === bangumi.id) {
                            if (bangumi.favorite_status !== Bangumi.WATCHING) {
                                bangumiList.splice(i, 1);
                            } else {
                                bangumiList[i] = bangumi;
                            }
                            found = true;
                            break;
                        }
                    }
                    if (!found && bangumi.favorite_status === Bangumi.WATCHING) {
                        bangumiList.unshift(bangumi);
                    }
                })
        );

        this._subscription.add(
            merge(
                this._statusSubject)
                .pipe(
                    mergeMap(() => {
                        return this._homeService.myBangumi(this.currentStatus)
                    }),)
                .subscribe((bangumiList) => {
                    // desc , sort by favorite_update_time and air_date
                    this.myBangumiList = this.sortBangumiList(bangumiList);
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

    /**
     * sort the bangmi list base on favorite_update_time if have, air_date time
     */
    private sortBangumiList(bangumiList: Bangumi[]): Bangumi[] {
        return bangumiList.sort((bgm1, bgm2) => {
            if (bgm1.favorite_update_time === bgm2.favorite_update_time) {
                let t1, t2;
                t1 = bgm1.air_date ? Date.parse(bgm1.air_date).valueOf() : Date.now();
                t2 = bgm2.air_date ? Date.parse(bgm2.air_date).valueOf() : Date.now();
                return t2 - t1;
            }
            return bgm2.favorite_update_time - bgm1.favorite_update_time;
        });
    }
}
