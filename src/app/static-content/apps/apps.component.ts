import { Component } from '@angular/core';

@Component({
    selector: 'apps-guide',
    templateUrl: './apps.html'
})
export class AppsComponent {
    siteTitle = SITE_TITLE;
    chromeExtensionId = CHROME_EXTENSION_ID;
}
