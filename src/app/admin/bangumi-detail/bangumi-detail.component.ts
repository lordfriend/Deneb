import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Bangumi, Episode, BangumiRaw} from '../../entity';
import {EpisodeDetail} from "./episode-detail/episode-detail.component";
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {AdminService} from '../admin.service';
import {KeywordBuilder} from './keyword-builder/keyword-builder.component';

@Component({
  selector: 'bangumi-detail',
  template: require('./bangumi-detail.html'),
  providers: [AdminService],
  directives: [EpisodeDetail, KeywordBuilder],
  styles:[`
    .bangumi-image {
      margin-right: 20px;
      margin-bottom: 30px;
    }
    .bangumi-image > img {
      width: 100%;
    }
  `]
})
export class BangumiDetail implements OnInit, OnDestroy {

  bangumi: Bangumi = <Bangumi>{};

  episodeList: Episode[] = [];
  errorMessage: any;

  isSavingBangumi: boolean = false;

  private from: string;
  private routeParamsSubscription: Subscription;
  private bangumiSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private _titleService: Title
  ){}

  ngOnInit(): any {
    this.routeParamsSubscription = this.route.params
      .flatMap((params) => {
        let id = params['id'];
        let bgm_id = Number(params['bgm_id']);
        this.from = id ? 'list' : 'search';
        if(bgm_id) {
          this._titleService.setTitle('添加新番 - ' + SITE_TITLE);
          return this.adminService.queryBangumi(bgm_id);
        } else if(id) {
          this._titleService.setTitle('编辑新番 - ' + SITE_TITLE);
          return this.adminService.getBangumi(id);
        }
      })
      .subscribe(
        (bangumi: BangumiRaw | Bangumi) => {
          this.bangumi = bangumi;
          if(this.from === 'search') {
            if(Array.isArray(bangumi.episodes) && bangumi.episodes.length > 0) {
              this.episodeList = bangumi.episodes;
            }
          }
        },
        error => this.errorMessage = <any>error
      );
    return undefined;
  }

  onSubmit(): void {
    this.isSavingBangumi = true;
    if(!this.bangumi.id) {
      this.bangumiSubscription = this.adminService.addBangumi(<BangumiRaw>this.bangumi)
        .subscribe(
          (id: string) => {
            this.isSavingBangumi = false;
            if(id) {
              this.router.navigate(['/admin/bangumi', id]);
            } else {
              this.errorMessage = 'No id return';
            }
          },
          (error:any) => {
            this.errorMessage = <any>error;
            this.isSavingBangumi = false;
          }
        )
    } else {
      this.bangumiSubscription = this.adminService.updateBangumi(this.bangumi)
        .subscribe(
          result => {
            console.log(result);
            this.isSavingBangumi = false;
          },
          error => {
            this.errorMessage = <any> error;
            this.isSavingBangumi = false;
          }
        );
    }
  }

  back(): void {
    if(this.from === 'search') {
      this.router.navigate(['/admin/search']);
    } else if(this.from === 'list') {
      this.router.navigate(['/admin/bangumi']);
    }
  }

  ngOnDestroy():any {
    if(this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
    if(this.bangumiSubscription) {
      this.bangumiSubscription.unsubscribe();
    }
    return null;
  }
}
