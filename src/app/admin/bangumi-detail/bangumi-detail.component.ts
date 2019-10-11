import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { BaseError } from '../../../helpers/error';
import { Bangumi, Episode } from '../../entity';
import { Announce } from '../../entity/announce';
import { User } from '../../entity';
import { AdminService } from '../admin.service';
import { AnnounceService } from '../announce/announce.service';
import { EditBangumiRecommendComponent } from '../announce/edit-bangumi-recommend/edit-bangumi-recommend.component';
import { UserManagerSerivce } from '../user-manager/user-manager.service';
import { BangumiBasic } from './bangumi-basic/bangumi-basic.component';
import { BangumiMoeBuilder } from './bangumi-moe-builder/bangumi-moe-builder.component';
import { EpisodeDetail } from './episode-detail/episode-detail.component';
import { KeywordBuilder } from './keyword-builder/keyword-builder.component';
import { VideoFileModal } from './video-file-modal/video-file-modal.component';

export enum AnnounceStatus {
    NOT_SET, NOT_YET, ANNOUNCING, EXPIRED
}

@Component({
    selector: 'bangumi-detail',
    templateUrl: './bangumi-detail.html',
    styleUrls: ['./bangumi-detail.less']
})
export class BangumiDetail implements OnInit, OnDestroy {

    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    private _bangumi = <Bangumi>{};

    set bangumi(bangumi: Bangumi) {
        this._bangumi = bangumi;
        if (this.bangumi.episodes && this.bangumi.episodes.length > 0) {
            this.orderedEpisodeList = this.bangumi.episodes.sort((episode1, episode2) => {
                return episode1.episode_no - episode2.episode_no;
            });
        } else {
            this.orderedEpisodeList = [];
        }
    }

    get bangumi(): Bangumi {
        return this._bangumi;
    }

    isLoading: boolean = false;

    // get orderedEpisodeList(): Episode[] {
    //     if (this.bangumi.episodes && this.bangumi.episodes.length > 0) {
    //         return this.bangumi.episodes.sort((episode1, episode2) => {
    //             return episode1.episode_no - episode2.episode_no;
    //         });
    //     }
    //     return [];
    // }
    orderedEpisodeList: Episode[] = [];

    adminList: User[];

    announceList: Announce[];
    announceStatus: AnnounceStatus;
    announceStatusText: string;

    AnnounceStatus = AnnounceStatus;

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _adminService: AdminService,
                private _userManagerService: UserManagerSerivce,
                private _announceService: AnnounceService,
                private _uiDialog: UIDialog,
                titleService: Title,
                toastService: UIToast
    ) {
        this._toastRef = toastService.makeText();
        titleService.setTitle('编辑新番 - ' + SITE_TITLE);
    }

    ngOnInit(): void {
        this._subscription.add(
            this._userManagerService
                .listUser({
                    count: -1,
                    offset: 0,
                    minlevel: User.LEVEL_ADMIN
                })
                .subscribe((result) => {
                    this.adminList = result.data;
                })
        );
        this._subscription.add(
            this._route.params.pipe(
                mergeMap((params) => {
                    let id = params['id'];
                    return this._adminService.getBangumi(id);
                }))
                .subscribe(
                    (bangumi: Bangumi) => {
                        this.bangumi = bangumi;
                        this.fetchAnnounceList(bangumi.id);
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
        let dialogRef = this._uiDialog.open(BangumiBasic, {stickyDialog: false, backdrop: true});
        dialogRef.componentInstance.bangumi = this.bangumi;
        dialogRef.componentInstance.adminList = this.adminList;
        this._subscription.add(
            dialogRef
                .afterClosed().pipe(
                filter((basicInfo: any) => !!basicInfo),
                mergeMap(
                    (basicInfo: any) => {
                        this.isLoading = true;
                        this.bangumi.name = basicInfo.name as string;
                        this.bangumi.name_cn = basicInfo.name_cn as string;
                        this.bangumi.summary = basicInfo.summary as string;
                        this.bangumi.air_date = basicInfo.air_date as string;
                        this.bangumi.air_weekday = basicInfo.air_weekday as number;
                        this.bangumi.eps_no_offset = basicInfo.eps_no_offset as number;
                        this.bangumi.status = basicInfo.status as number;
                        this.bangumi.maintained_by = this.adminList.find(user => user.id == basicInfo.maintained_by_uid);
                        this.bangumi.alert_timeout = basicInfo.alert_timeout as number;
                        return this._adminService.updateBangumi(this.bangumi);
                    }
                ),)
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
        let dialogRef = this._uiDialog.open(KeywordBuilder, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.keyword = this.bangumi[siteName];
        dialogRef.componentInstance.siteName = siteName;
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter((result: any) => !!result),
                mergeMap((result: any) => {
                    this.isLoading = true;
                    this.bangumi[siteName] = result.keyword as string;
                    return this._adminService.updateBangumi(this.bangumi);
                }),)
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
        let dialogRef = this._uiDialog.open(BangumiMoeBuilder, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.bangumi = this.bangumi;
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter((result: any) => !!result),
                mergeMap((result: any) => {
                    this.isLoading = true;
                    this.bangumi.bangumi_moe = result.result as string;
                    return this._adminService.updateBangumi(this.bangumi);
                }),)
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
        let dialogRef = this._uiDialog.open(EpisodeDetail, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.episode = episode;
        dialogRef.componentInstance.bangumi_id = this.bangumi.id;
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter((result: boolean) => result),
                mergeMap(() => {
                    this.isLoading = true;
                    return this._adminService.getBangumi(this.bangumi.id);
                }),)
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

    editVideoFile(episode: Episode) {
        let dialogRef = this._uiDialog.open(VideoFileModal, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.episode = episode;
    }

    deleteEpisode(episode_id: string) {
        this._subscription.add(
            this._adminService.deleteEpisode(episode_id).pipe(
                mergeMap(() => {
                    this._toastRef.show(`删除成功`);
                    return this._adminService.getBangumi(this.bangumi.id);
                }))
                .subscribe(
                    (bangumi) => {
                        this.bangumi = bangumi;
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    deleteBangumi() {
        this._subscription.add(
            this._adminService.deleteBangumi(this.bangumi.id)
                .subscribe(
                    ({delete_delay}) => {
                        this._toastRef.show(`将在${delete_delay}分钟后删除，你可以在任务管理中取消删除`);
                        this._router.navigate(['/admin/bangumi']);
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    addOrEditAnnounce() {
        const dialogRef = this._uiDialog.open(EditBangumiRecommendComponent, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.bangumi = this.bangumi;
        if (this.announceList.length > 0) {
            dialogRef.componentInstance.announce = this.announceList[0];
        }
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter(result => !!result),
                mergeMap((info) => {
                    if (this.announceList.length > 0) {
                        return this._announceService.updateAnnounce(this.announceList[0].id, info as Announce);
                    }
                    return this._announceService.addAnnounce(info as Announce);
                }),)
                .subscribe(() => {
                    this._toastRef.show('添加成功');
                    this.fetchAnnounceList(this.bangumi.id);
                })
        );
    }

    private fetchAnnounceList(bangumi_id: string) {
        this._subscription.add(
            this._announceService.listAnnounce(2,0, 10, bangumi_id)
                .subscribe(({data}) => {
                    this.announceList = data;
                    let currentTime = Date.now();
                    this.announceStatus = AnnounceStatus.NOT_SET;
                    this.announceStatusText = '推荐这个番組';
                    if (data.length > 0) {
                        let announce = data[0];
                        if (announce.start_time < currentTime && announce.end_time > currentTime) {
                            this.announceStatus = AnnounceStatus.ANNOUNCING;
                            this.announceStatusText = '推荐中';
                        } else if (announce.end_time < currentTime) {
                            this.announceStatus = AnnounceStatus.EXPIRED;
                            this.announceStatusText = '已过期';
                        } else if (announce.start_time > currentTime) {
                            this.announceStatus = AnnounceStatus.NOT_YET;
                            this.announceStatusText = '即将推荐';
                        }
                    }
                })
        );
    }

    // getVideoFiles(episode: Episode) {
    //     this._subscription.add(
    //         this._adminService.getEpisodeVideoFiles(episode.id)
    //             .subscribe(
    //                 (videoFiles => {
    //                     episode.video_files = videoFiles;
    //                 })
    //             )
    //     );
    // }
}
