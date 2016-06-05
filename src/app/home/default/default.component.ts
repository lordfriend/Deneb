import {Component, OnInit} from '@angular/core';
import {Episode} from "../../entity/episode";
import {HomeService, HomeChild} from "../home.service";
import {Bangumi} from "../../entity/bangumi";

@Component({
  selector: 'default-component',
  template: require('./default.html')
})
export class DefaultComponent extends HomeChild implements OnInit {

  recentEpisodes:Episode[];

  onAirBangumi: Bangumi[];

  constructor(homeService:HomeService) {
    super(homeService);
  }


  ngOnInit():any {
    this.homeService.recentEpisodes()
      .subscribe(
        (episodeList: Episode[]) => {
          this.recentEpisodes = episodeList;
        },
        error => console.log(error)
      );

    this.homeService.onAir()
      .subscribe(
        (bangumiList:Bangumi[]) => {
          this.onAirBangumi = bangumiList;
        },
        error => console.log(error)
      );

    return null;
  }
}
