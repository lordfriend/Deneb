import { Component, OnDestroy } from '@angular/core';
import { UIPopoverContent, UIPopoverRef } from 'deneb-ui';
import { Subscription ,  Observable } from 'rxjs';
import { isChrome, isEdge, isFirefox } from '../../../../helpers/browser-detect';

@Component({
    selector: 'chrome-extension-tip',
    templateUrl: './browser-extension-tip.html',
    styleUrls: ['./browser-extension-tip.less']
})
export class BrowserExtensionTipComponent extends UIPopoverContent implements OnDestroy {
    private _subscription = new Subscription();

    extensionId: string;
    browserType: string;
    firefoxExtensionUrl: string;

    get installUrl(): string {
        return {
            'Chrome': 'https://chrome.google.com/webstore/detail/' + this.extensionId,
            'Firefox': this.firefoxExtensionUrl,
            'Edge': ''
        }[this.browserType];
    }

    constructor(popoverRef: UIPopoverRef<BrowserExtensionTipComponent>) {
        super(popoverRef);
        this.browserType = isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isEdge ? 'Edge': 'Unsupported';
    }
    // inline install temporarily disabled
    // installExtension(event: Event) {
    //     event.preventDefault();
    //     event.stopPropagation();
    //     chrome.webstore.install(`https://chrome.google.com/webstore/detail/${this.chromeExtensionId}`, () => {
    //         this.popoverRef.close();
    //     }, () => {
    //         this.popoverRef.close();
    //     });
    // }

    onClickButton() {
        this.popoverRef.close();
    }

    // ngAfterViewInit(): void {
    //     super.ngAfterViewInit();
    //     this._subscription.add(
    //         Observable.fromEvent(document.body, 'click')
    //             .subscribe(() => {
    //                 this.popoverRef.close();
    //             })
    //     );
    // }

    ngOnDestroy(): void {
    }
}
