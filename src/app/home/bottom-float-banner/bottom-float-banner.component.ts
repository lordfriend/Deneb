import { Component, HostBinding } from '@angular/core';

@Component({
    selector: 'bottom-float-banner',
    templateUrl: './bottom-float-banner.html',
    styleUrls: ['./bottom-float-banner.less'],
})
export class BottomFloatBannerComponent {

    @HostBinding('class.show')
    showBanner = false;

    constructor() {
        const ua = navigator.userAgent;
        this.showBanner = ua.toLowerCase().indexOf('android') > -1;
    }

    closeBanner(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.showBanner = false;
    }
}
