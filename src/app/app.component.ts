/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

import { AnalyticsService } from './analytics.service';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'app',
    template: `
        <router-outlet>
        </router-outlet>
    `,
    encapsulation: ViewEncapsulation.None
})
export class App {

    private routeEventsSubscription: Subscription;

    private removePreLoader() {
        if (document) {
            let $body = document.body;
            let preloader = document.getElementById('preloader');
            if (preloader) {
                $body.removeChild(preloader);
                this.routeEventsSubscription.unsubscribe();
            }
            $body.classList.remove('loading');
        }
    }

    constructor(analyticsSerivce: AnalyticsService, router: Router) {
        this.routeEventsSubscription = router.events
            .subscribe(
                (event) => {
                    if (event instanceof NavigationEnd) {
                        this.removePreLoader();
                    }
                }
            )
    }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
