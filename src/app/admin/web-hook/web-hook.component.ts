import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { getRemPixel } from '../../../helpers/dom';
import { BaseError } from '../../../helpers/error/BaseError';
import { WebHook } from '../../entity/web-hook';
import { EditWebHookComponent } from './edit-web-hook/edit-web-hook.component';
import { WebHookService } from './web-hook.service';

const CARD_HEIGHT_REM = 12;

@Component({
    selector: 'web-hook-manager',
    templateUrl: './web-hook.html',
    styleUrls: ['./web-hook.less']
})
export class WebHookComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    webHookList: WebHook[];

    isLoading = true;

    cardHeight: number;

    constructor(private _webHookService: WebHookService,
                private _dialog: UIDialog,
                toast: UIToast,
                titleService: Title) {
        titleService.setTitle('WebHook管理 - ' + SITE_TITLE);
        this._toastRef = toast.makeText();
        if (window) {
            this.cardHeight = getRemPixel(CARD_HEIGHT_REM)
        }
    }

    addWebHook() {
        const dialogRef = this._dialog.open(EditWebHookComponent, {stickyDialog: true, backdrop: true});
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter(result => !!result),
                mergeMap((result) => {
                    return this._webHookService.registerWebHook(result.result);
                }),)
                .subscribe(() => {
                    this.refreshList();
                }, (error: BaseError) => {
                    this._toastRef.show(error.message);
                })
        );
    }

    editWebHook(webHook: WebHook) {
        const dialogRef = this._dialog.open(EditWebHookComponent, {stickyDialog: true, backdrop: true});
        dialogRef.componentInstance.webHook = webHook;
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter(result => !!result),
                mergeMap((result) => {
                    if (result.deleteWebHook) {
                        return this._webHookService.deleteWebHook(webHook.id);
                    } else {
                        return this._webHookService.updateWebHook(webHook.id, result.result);
                    }
                }),)
                .subscribe(() => {
                    this.refreshList();
                }, (error: BaseError) => {
                    this._toastRef.show(error.message);
                })
        );
    }


    ngOnInit(): void {
        this.refreshList();
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private refreshList() {
        this.isLoading = true;
        this._subscription.add(
            this._webHookService.listWebHook()
                .subscribe((list) => {
                    this.isLoading = false;
                    this.webHookList = list;
                }, (error: BaseError) => {
                    this.isLoading = false;
                    this._toastRef.show(error.message);
                })
        );
    }
}
