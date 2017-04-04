import {Component, OnInit} from '@angular/core';
import {Episode} from "../../entity/episode";
import {HomeService, HomeChild} from "../home.service";
import {Bangumi} from "../../entity/bangumi";
import {FAVORITE_LABEL} from '../../entity/constants';

@Component({
    selector: 'default-component',
    templateUrl: './default.html',
    styleUrls: ['./default.less']
})
export class DefaultComponent extends HomeChild implements OnInit {

    recentEpisodes: Episode[];

    onAirBangumi: Bangumi[];

    bangumiType = 2; // 2 is anime, 6 is japanese tv drama Series

    FAVORITE_LABEL = FAVORITE_LABEL;

    constructor(homeService: HomeService) {
        super(homeService);
    }

    changeBangumiType(type: number) {
        this.bangumiType = type;
        this.getOnAir();
    }

    getOnAir() {
        this.homeService.onAir(this.bangumiType)
            .subscribe(
                (bangumiList: Bangumi[]) => {
                    this.onAirBangumi = bangumiList;
                },
                error => console.log(error)
            );
    }

    ngOnInit(): any {
        // this.homeService.recentEpisodes()
        //   .subscribe(
        //     (episodeList: Episode[]) => {
        //       this.recentEpisodes = episodeList;
        //     },
        //     error => console.log(error)
        //   );
        this.getOnAir();

        return null;
    }
}
