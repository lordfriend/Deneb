import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'apps-guide',
    templateUrl: './apps.html',
    styleUrls: ['./apps.less']
})
export class AppsComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    siteTitle = SITE_TITLE;
    chromeExtensionId = CHROME_EXTENSION_ID;

    showAndroid: boolean;

    expanded1 = false;

    expanded2 = false;

    constructor(private _route: ActivatedRoute,
                titleService: Title) {
        titleService.setTitle(`Apps - ${SITE_TITLE}`);
    }

    ngOnInit(): void {
        this._subscription.add(
            this._route.params
                .subscribe(params => {
                    console.log(params);
                    this.showAndroid = !!params['android'];
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    expand1(): void {
        this.expanded1 = true;
    }

    expand2(): void {
        this.expanded2 = true;
    }
}
