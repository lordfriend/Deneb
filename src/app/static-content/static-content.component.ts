import { Component } from '@angular/core';

@Component({
    selector: 'static-content',
    templateUrl: './static-content.html',
    styleUrls: ['./static-content.less']
})
export class StaticContentComponent {
    siteTitle: string = SITE_TITLE;
}
