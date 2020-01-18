import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChromeExtensionService, ENABLED_STATUS } from '../../browser-extension/chrome-extension.service';
import { PERM_NAME, WebHook } from '../../entity/web-hook';

@Component({
    selector: 'web-hook',
    templateUrl: './web-hook.html',
    styleUrls: ['./web-hook.less']
})
export class WebHookComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    webHookList: WebHook[];
    siteTitle = SITE_TITLE;

    isBgmEnabled: boolean;

    constructor(private _http: HttpClient,
                private _chromeExtensionService: ChromeExtensionService,
                toastService: UIToast,
                titleService: Title) {
        titleService.setTitle(`Web Hook列表 - ${SITE_TITLE}`);
        this._toastRef = toastService.makeText();
    }

    ngOnInit(): void {
        this._subscription.add(
            this._http.get<{data: any[]}>('/api/web-hook/').pipe(
                map((res) => {
                    return res.data.map(webHook => {
                        if (webHook.permissions) {
                            webHook.permissions = JSON.parse(webHook.permissions as string) as string[];
                        } else {
                            webHook.permissions = []
                        }
                        webHook.permissions = webHook.permissions.map(perm_key => PERM_NAME[perm_key]);
                        return webHook as WebHook;
                    });
                }))
                .subscribe((webHookList) => {
                    this.webHookList = webHookList;
                }, (err) => {
                    if (err.status && err.status !== 502 && err.status !== 504) {
                        this._toastRef.show(err.message);
                    } else {
                        this._toastRef.show('网络错误');
                    }
                })
        );
        this._subscription.add(
            this._chromeExtensionService.isEnabled
                .subscribe(isEnabled => {
                    this.isBgmEnabled = isEnabled === ENABLED_STATUS.TRUE;
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

}
