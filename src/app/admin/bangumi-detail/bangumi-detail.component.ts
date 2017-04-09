import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Bangumi, Episode} from '../../entity';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {AdminService} from '../admin.service';
import {UIDialog, UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {BangumiBasic} from './bangumi-basic/bangumi-basic.component';
import {BaseError} from '../../../helpers/error/BaseError';
import {KeywordBuilder} from './keyword-builder/keyword-builder.component';
import {EpisodeDetail} from './episode-detail/episode-detail.component';
import {BangumiMoeBuilder} from './bangumi-moe-builder/bangumi-moe-builder.component';

@Component({
    selector: 'bangumi-detail',
    templateUrl: './bangumi-detail.html',
    styleUrls: ['./bangumi-detail.less']
})
export class BangumiDetail implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    bangumi: Bangumi = <Bangumi>{};

    isLoading: boolean = false;

    get orderedEpisodeList(): Episode[] {
        if (this.bangumi.episodes && this.bangumi.episodes.length > 0) {
            return this.bangumi.episodes.sort((episode1, episode2) => {
                return episode1.episode_no - episode2.episode_no
            });
        }
        return [];
    }

    constructor(private _route: ActivatedRoute,
                private _adminService: AdminService,
                private _uiDialog: UIDialog,
                titleService: Title,
                toastService: UIToast
    ) {
        this._toastRef = toastService.makeText();
        titleService.setTitle('编辑新番 - ' + SITE_TITLE);
    }

    ngOnInit(): void {
        this._subscription.add(
            this._route.params
                .flatMap((params) => {
                    let id = params['id'];
                    return this._adminService.getBangumi(id);
                })
                .subscribe(
                    (bangumi: Bangumi) => {
                        this.bangumi = bangumi;
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    editBasicInfo() {
        let dialogRef = this._uiDialog.open(BangumiBasic, {stickyDialog: false});
        dialogRef.componentInstance.bangumi = this.bangumi;
        this._subscription.add(
            dialogRef
                .afterClosed()
                .filter((basicInfo: any) => !!basicInfo)
                .flatMap(
                    (basicInfo: any) => {
                        this.isLoading = true;
                        this.bangumi.name = basicInfo.name as string;
                        this.bangumi.name_cn = basicInfo.name_cn as string;
                        this.bangumi.summary = basicInfo.summary as string;
                        this.bangumi.air_date = basicInfo.air_date as string;
                        this.bangumi.air_weekday = basicInfo.air_weekday as number;
                        this.bangumi.eps_no_offset = basicInfo.eps_no_offset as number;
                        this.bangumi.status = basicInfo.status as number;
                        return this._adminService.updateBangumi(this.bangumi);
                    }
                )
                .subscribe(
                    () => {
                        this.isLoading = false;
                        this._toastRef.show('更新成功');
                    },
                    (error: BaseError) => {
                        this.isLoading = false;
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    editKeyword(siteName: string) {
        let dialogRef = this._uiDialog.open(KeywordBuilder, {stickyDialog: true});
        dialogRef.componentInstance.keyword = this.bangumi[siteName];
        dialogRef.componentInstance.siteName = siteName;
        this._subscription.add(
            dialogRef.afterClosed()
                .filter((result: any) => !!result)
                .flatMap((result: any) => {
                    this.isLoading = true;
                    this.bangumi[siteName] = result.keyword as string;
                    return this._adminService.updateBangumi(this.bangumi);
                })
                .subscribe(
                    () => {
                        this.isLoading = false;
                        this._toastRef.show('更新成功');
                    },
                    (error: BaseError) => {
                        this.isLoading = false;
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    editBangumiMoe() {
        let dialogRef = this._uiDialog.open(BangumiMoeBuilder, {stickyDialog: true});
        dialogRef.componentInstance.bangumi = this.bangumi;
        this._subscription.add(
            dialogRef.afterClosed()
                .filter((result: any) => !!result)
                .flatMap((result: any) => {
                    this.isLoading = true;
                    this.bangumi.bangumi_moe = result.result as string;
                    return this._adminService.updateBangumi(this.bangumi);
                })
                .subscribe(
                    () => {
                        this.isLoading = false;
                        this._toastRef.show('更新成功');
                    },
                    (error: BaseError) => {
                        this.isLoading = false;
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    editEpisode(episode?: Episode) {
        let dialogRef = this._uiDialog.open(EpisodeDetail, {stickyDialog: true})
        dialogRef.componentInstance.episode = episode;
        this._subscription.add(
            dialogRef.afterClosed()
                .filter((result: boolean) => result)
                .flatMap(() => {
                    this.isLoading = true;
                    return this._adminService.getBangumi(this.bangumi.id);
                })
                .subscribe(
                    (bangumi: Bangumi) => {
                        this.isLoading = false;
                        this.bangumi = bangumi;
                    },
                    (error: BaseError) => {
                        this.isLoading = false;
                        this._toastRef.show(error.message);
                    }
                )
        )
    }
}
