import {Component, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Bangumi, Episode, BangumiRaw} from '../../entity';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {AdminService} from '../admin.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UIDialog} from 'deneb-ui';
import {BangumiBasic} from './bangumi-basic/bangumi-basic.component';

@Component({
    selector: 'bangumi-detail',
    templateUrl: './bangumi-detail.html',
    providers: [AdminService],
    styles: [`
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

    get orderedEpisodeList(): Episode[] {
        if (this.bangumi.episodes && this.bangumi.episodes.length > 0) {
            return this.bangumi.episodes.sort((episode1, episode2) => {
                return episode1.episode_no - episode2.episode_no
            });
        }
        return [];
    }

    episodeList: Episode[] = [];
    errorMessage: any;

    isSavingBangumi: boolean = false;

    private from: string;
    private routeParamsSubscription: Subscription;
    private bangumiSubscription: Subscription;

    private _subscription = new Subscription();

    constructor(private router: Router,
                private route: ActivatedRoute,
                private adminService: AdminService,
                private _titleService: Title,
                private _uiDialog: UIDialog
                // private _toastService: UIToast
    ) {}

    ngOnInit(): any {
        // this.toastRef = this._toastService.makeText();
        this.routeParamsSubscription = this.route.params
            .flatMap((params) => {
                let id = params['id'];
                let bgm_id = Number(params['bgm_id']);
                this.from = id ? 'list' : 'search';
                if (bgm_id) {
                    this._titleService.setTitle('添加新番 - ' + SITE_TITLE);
                    return this.adminService.queryBangumi(bgm_id);
                } else if (id) {
                    this._titleService.setTitle('编辑新番 - ' + SITE_TITLE);
                    return this.adminService.getBangumi(id);
                }
            })
            .subscribe(
                (bangumi: BangumiRaw | Bangumi) => {
                    this.bangumi = bangumi;
                    if (this.from === 'search') {
                        if (Array.isArray(bangumi.episodes) && bangumi.episodes.length > 0) {
                            this.episodeList = bangumi.episodes;
                        }
                    }
                },
                error => {
                    // this.toastRef.show(error);
                }
            );
        return undefined;
    }

    editBasicInfo() {
        let dialogRef = this._uiDialog.open(BangumiBasic, {stickyDialog: true});
        dialogRef.componentInstance.bangumi = this.bangumi;
        this._subscription.add(
            dialogRef
                .afterClosed()
                .subscribe(
                    (basicInfo: any) => {
                        // TODO: merge result
                    }
                ));
    }

    addEpisode() {
        let episode = new Episode();
        episode.bangumi_id = this.bangumi.id;
        episode.status = Episode.STATUS_NOT_DOWNLOADED;
        if (this.bangumi.episodes && this.bangumi.episodes.length > 0) {
            episode.episode_no = this.bangumi.episodes[this.bangumi.episodes.length - 1].episode_no + 1;
        } else {
            episode.episode_no = 1;
        }
        this.bangumi.episodes.push(episode);
    }

    onEpisodeDelete(episode: Episode) {
        let index = this.bangumi.episodes.indexOf(episode);
        if (index !== -1) {
            this.bangumi.episodes.splice(index, 1);
        }
    }

    onEpisodeAdded(episode_id: string, episode: Episode) {
        this.adminService.getEpisode(episode_id)
            .subscribe(
                (refreshedEpisode: Episode) => {
                    let index = this.bangumi.episodes.indexOf(episode);
                    if (index !== -1) {
                        this.bangumi.episodes[index] = refreshedEpisode;
                    }
                },
                error => console.log(error)
            );
    }

    onSubmit(): void {
        this.isSavingBangumi = true;
        if (!this.bangumi.id) {
            this.bangumiSubscription = this.adminService.addBangumi(<BangumiRaw>this.bangumi)
                .subscribe(
                    (id: string) => {
                        this.isSavingBangumi = false;
                        if (id) {
                            this.router.navigate(['/admin/bangumi', id]);
                        } else {
                            // this.toastRef.show('No id return');
                        }
                    },
                    (error: any) => {
                        // this.toastRef.show(error);
                        this.isSavingBangumi = false;
                    }
                )
        } else {
            this.bangumiSubscription = this.adminService.updateBangumi(this.bangumi)
                .subscribe(
                    result => {
                        // this.toastRef.show('更新成功');
                        this.isSavingBangumi = false;
                    },
                    error => {
                        // this.toastRef.show(error);
                        this.isSavingBangumi = false;
                    }
                );
        }
    }

    back(): void {
        if (this.from === 'search') {
            this.router.navigate(['/admin/search']);
        } else if (this.from === 'list') {
            this.router.navigate(['/admin/bangumi']);
        }
    }

    ngOnDestroy(): any {
        if (this.routeParamsSubscription) {
            this.routeParamsSubscription.unsubscribe();
        }
        if (this.bangumiSubscription) {
            this.bangumiSubscription.unsubscribe();
        }
        return null;
    }
}
