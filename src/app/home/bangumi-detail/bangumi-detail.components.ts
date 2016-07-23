import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {HomeService, HomeChild} from "../home.service";
import {Bangumi} from "../../entity/bangumi";
import {RouteParams} from "@angular/router-deprecated";
import {WeekdayPipe} from "../../pipes/weekday.pipe";
import {Observable, Subscription} from "rxjs/Rx";

@Component({
  selector: 'view-bangumi-detail',
  template: require('./bangumi-detail.html'),
  pipes: [WeekdayPipe]
})
export class BangumiDetail extends HomeChild implements OnInit, OnDestroy {

  bangumi:Bangumi = new Bangumi();

  orientation: 'landscape' | 'portrait';
  coverRevealerHeight: string;

  @ViewChild('bangumiCover') bangumiCoverRef:ElementRef;

  private _resizeSubscription: Subscription;
  private _coverExpaneded: boolean = false;

  constructor(
    homeService:HomeService,
    private _routeParams: RouteParams
  ) {
    super(homeService);
  }

  private checkViewport() {
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    if(viewportWidth < 768) {
      this.orientation = 'portrait';
      this.coverRevealerHeight = Math.round(viewportHeight / 4) + 'px';
    } else {
      this.orientation = 'landscape';
      this.coverRevealerHeight = 0 + '';
    }
  }

  toggleCover() {
    if(this._coverExpaneded) {
      this.checkViewport();
    } else {
      this.coverRevealerHeight = (this.bangumiCoverRef.nativeElement.clientHeight - 14) + 'px';
    }
    this._coverExpaneded = !this._coverExpaneded;
  }

  ngOnInit():any {
    let bangumi_id = this._routeParams.get('bangumi_id');
    this.homeService.bangumi_datail(bangumi_id)
      .subscribe(
        (bangumi: Bangumi) => {
          this.bangumi = bangumi;
        },
        error => console.log(error)
      );

    this.checkViewport();

    this._resizeSubscription = Observable.fromEvent(window, 'resize')
      .subscribe(
        () => {
          this.checkViewport();
        }
      );
    return null;
  }


  ngOnDestroy():any {
    this._resizeSubscription.unsubscribe();
    return null;
  }
}
