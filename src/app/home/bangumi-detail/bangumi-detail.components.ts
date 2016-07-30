import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {HomeService, HomeChild} from "../home.service";
import {Bangumi} from "../../entity/bangumi";
import {WeekdayPipe} from "../../pipes/weekday.pipe";
import {Observable, Subscription} from "rxjs/Rx";
import {ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'view-bangumi-detail',
  template: require('./bangumi-detail.html'),
  pipes: [WeekdayPipe]
})
export class BangumiDetail extends HomeChild implements OnInit, OnDestroy {

  bangumi:Bangumi;

  orientation: 'landscape' | 'portrait';
  coverRevealerHeight: string;

  @ViewChild('bangumiCover') bangumiCoverRef:ElementRef;

  private _resizeSubscription: Subscription;
  private _coverExpaneded: boolean = false;
  private routeParamsSubscription: Subscription;

  constructor(
    homeService:HomeService,
    private route: ActivatedRoute,
    private titleService: Title
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
    this.routeParamsSubscription = this.route.params
      .flatMap((params) => {
        return this.homeService.bangumi_datail(params['bangumi_id']);
      })
      .subscribe(
        (bangumi: Bangumi) => {
          let bgmTitle = `${bangumi.name} - ${SITE_TITLE}`;
          this.titleService.setTitle(bgmTitle);
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
    this.routeParamsSubscription.unsubscribe();
    return null;
  }
}
