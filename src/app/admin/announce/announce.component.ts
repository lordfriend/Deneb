import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { Announce } from '../../entity/announce';
import { AnnounceService } from './announce.service';
import { EditAnnounceComponent } from './edit-announce/edit-announce.component';
import { EditBangumiRecommendComponent } from './edit-bangumi-recommend/edit-bangumi-recommend.component';


@Component({
    selector: 'admin-announce',
    templateUrl: './announce.html',
    styleUrls: ['./announce.less']
})
export class AnnounceComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    announceList: Announce[];
    recommendList: Announce[];

    announcePage = 1;
    announceCount = 10;
    announceTotal = 0;

    recommendPage = 1;
    recommendCount = 10;
    recommendTotal = 0;

    constructor(private _announceService: AnnounceService,
                private _dialog: UIDialog,
                toastService: UIToast,
                titleService: Title) {
        titleService.setTitle(`公告管理 - ${SITE_TITLE}`);
        this._toastRef = toastService.makeText();
    }

    addAnnounce() {
        const dialogRef = this._dialog.open(EditAnnounceComponent, {stickyDialog: true, backdrop: true});
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter(result => !!result),
                mergeMap((info) => {
                    return this._announceService.addAnnounce(info as Announce);
                }),)
                .subscribe(() => {
                    this._toastRef.show('添加成功');
                    this.refreshAnnounce(this.announcePage);
                })
        );
    }

    editAnnounce(announce: Announce) {
        const dialogRef = this._dialog.open(EditAnnounceComponent, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.announce = announce;
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter(result => !!result),
                mergeMap((info) => {
                    return this._announceService.updateAnnounce(announce.id, info as Announce);
                }),)
                .subscribe(() => {
                    this._toastRef.show('更新成功');
                    this.refreshAnnounce(this.announcePage);
                })
        );
    }
    editRecommend(announce: Announce) {
        const dialogRef = this._dialog.open(EditBangumiRecommendComponent, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.announce = announce;
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter(result => !!result),
                mergeMap((info) => {
                    return this._announceService.updateAnnounce(announce.id, info as Announce);
                }),)
                .subscribe(() => {
                    this._toastRef.show('更新成功');
                    this.refreshRecommend(this.recommendPage);
                })
        );
    }

    deleteAnnounce(announce_id: string) {
        this._subscription.add(
            this._announceService.deleteAnnounce(announce_id)
                .subscribe(() => {
                    this._toastRef.show('删除成功');
                    this.refreshAnnounce(this.announcePage);
                })
        );
    }

    deleteRecommend(announce_id: string) {
        this._subscription.add(
            this._announceService.deleteAnnounce(announce_id)
                .subscribe(() => {
                    this._toastRef.show('删除成功');
                    this.refreshRecommend(this.recommendPage);
                })
        );
    }

    refreshAnnounce(page: number) {
        let offset = (page - 1) * this.announceCount;
        this._subscription.add(
            this._announceService.listAnnounce(Announce.POSITION_BANNER, offset, this.announceCount)
                .subscribe((result) => {
                    this.announceList = result.data;
                    this.announceTotal = result.total;
                })
        );
    }

    refreshRecommend(page: number) {
        let offset = (page - 1) * this.announceCount;
        this._subscription.add(
            this._announceService.listAnnounce(Announce.POSITION_BANGUMI, offset, this.announceCount)
                .subscribe((result) => {
                    this.recommendList = result.data;
                    this.recommendTotal = result.total;
                })
        );
    }

    ngOnInit(): void {
        this.refreshAnnounce(this.announcePage);
        this.refreshRecommend(this.recommendPage);
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
