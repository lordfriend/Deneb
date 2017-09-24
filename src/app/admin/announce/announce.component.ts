import { Component, OnDestroy, OnInit } from '@angular/core';
import { Announce } from '../../entity/announce';
import { Subscription } from 'rxjs/Subscription';
import { AnnounceService } from './announce.service';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { EditAnnounceComponent } from './edit-announce/edit-announce.component';


@Component({
    selector: 'admin-announce',
    templateUrl: './announce.html',
    styleUrls: ['./announce.less']
})
export class AnnounceComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    announceList: Announce[];

    page = 1;
    count = 10;
    total = 0;

    constructor(private _announceService: AnnounceService,
                private _dialog: UIDialog,
                toastService: UIToast) {
        this._toastRef = toastService.makeText();
    }

    addAnnounce() {
        const dialogRef = this._dialog.open(EditAnnounceComponent, {stickyDialog: true, backdrop: true});
        this._subscription.add(
            dialogRef.afterClosed()
                .filter(result => !!result)
                .flatMap((info) => {
                    return this._announceService.addAnnounce(info as Announce);
                })
                .subscribe(() => {
                    this._toastRef.show('添加成功');
                    this.refresh(this.page);
                })
        );
    }

    editAnnounce(announce: Announce) {
        const dialogRef = this._dialog.open(EditAnnounceComponent, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.announce = announce;
        this._subscription.add(
            dialogRef.afterClosed()
                .filter(result => !!result)
                .flatMap((info) => {
                    return this._announceService.updateAnnounce(announce.id, info as Announce);
                })
                .subscribe(() => {
                    this._toastRef.show('更新成功');
                    this.refresh(this.page);
                })
        );
    }

    deleteAnnounce(announce_id: string) {
        this._subscription.add(
            this._announceService.deleteAnnounce(announce_id)
                .subscribe(() => {
                    this._toastRef.show('删除成功');
                    this.refresh(this.page);
                })
        );
    }

    refresh(page: number) {
        let offset = (page - 1) * this.count;
        this._subscription.add(
            this._announceService.listAnnounce(offset, this.count)
                .subscribe((result) => {
                    this.announceList = result.data;
                    this.total = result.total;
                })
        );
    }

    ngOnInit(): void {
        this.refresh(this.page);
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
