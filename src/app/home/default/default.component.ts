import { Component, OnDestroy, OnInit } from '@angular/core';
// import {Episode} from "../../entity/episode";
import {HomeService, HomeChild} from "../home.service";
import {Bangumi} from "../../entity/bangumi";
import {FAVORITE_LABEL} from '../../entity/constants';
import { Subscription } from 'rxjs';
import { Announce } from '../../entity/announce';
import { PersistStorage } from '../../user-service/persist-storage';

const BANGUMI_TYPE_KEY = 'default_bangumi_type';

@Component({
    selector: 'default-component',
    templateUrl: './default.html',
    styleUrls: ['./default.less']
})
export class DefaultComponent extends HomeChild implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    // recentEpisodes: Episode[];

    onAirBangumi: Bangumi[];

    bangumiType = 2; // 2 is anime, 6 is japanese tv drama Series

    FAVORITE_LABEL = FAVORITE_LABEL;

    announce_in_banner: Announce;
    announce_in_bangumi: Announce[];

    constructor(homeService: HomeService, private _persistStorage: PersistStorage) {
        super(homeService);
    }

    changeBangumiType(type: number) {
        this.bangumiType = type;
        this._persistStorage.setItem(BANGUMI_TYPE_KEY, `${type}`);
        this.getOnAir();
    }

    getOnAir() {
        this._subscription.add(
            this.homeService.onAir(this.bangumiType)
                .subscribe(
                    (bangumiList: Bangumi[]) => {
                        this.onAirBangumi = bangumiList;
                    },
                    error => console.log(error)
                )
        );
    }

    ngOnInit(): void {
        // this.homeService.recentEpisodes()
        //   .subscribe(
        //     (episodeList: Episode[]) => {
        //       this.recentEpisodes = episodeList;
        //     },
        //     error => console.log(error)
        //   );
        let defaultBangumiType = this._persistStorage.getItem(BANGUMI_TYPE_KEY, null);
        if (defaultBangumiType !== null) {
            this.bangumiType = parseInt(defaultBangumiType, 10);
        }
        this.getOnAir();
        this._subscription.add(
            this.homeService.listAnnounce()
                .subscribe((announce_list) => {
                    this.announce_in_banner = announce_list.find((announce) => {
                        return announce.position === Announce.POSITION_BANNER;
                    });
                    this.announce_in_bangumi = announce_list.filter(announce => {
                        return announce.position === Announce.POSITION_BANGUMI;
                    })
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
