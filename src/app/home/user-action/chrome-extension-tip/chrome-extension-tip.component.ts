import { Component, OnDestroy } from '@angular/core';
import { UIPopoverContent, UIPopoverRef } from 'deneb-ui';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'chrome-extension-tip',
    templateUrl: './chrome-extension-tip.html',
    styleUrls: ['./chrome-extension-tip.less']
})
export class ChromeExtensionTipComponent extends UIPopoverContent implements OnDestroy {
    private _subscription = new Subscription();

    chromeExtensionId = CHROME_EXTENSION_ID;

    constructor(popoverRef: UIPopoverRef<ChromeExtensionTipComponent>) {
        super(popoverRef);
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
