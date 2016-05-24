import {Component, OnInit} from '@angular/core';
import {Episode} from "../../entity/episode";
import {HomeService} from "../home.service";

@Component({
  selector: 'default-component',
  template: require('./default.html')
})
export class DefaultComponent implements OnInit {

  recentEpisodes:Episode[];

  constructor(private _homeService:HomeService) {
  }


  ngOnInit():any {
    this._homeService.recentEpisodes()
      .subscribe(
        (episodeList: Episode[]) => {
          this.recentEpisodes = episodeList;
        },
        error => console.log(error)
      );

    return null;
  }
}
