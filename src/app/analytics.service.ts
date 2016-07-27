
import {Injectable} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
@Injectable()
export class AnalyticsService {

  constructor(private router: Router) {
    this.router.events
      .subscribe(
        (event) => {
          if(event instanceof NavigationEnd) {
            this.routeChanged(this.getPath(event.url));
          }
        }
      )
  }

  private getPath(url: string): string {
    return url.split(';')[0];
  }

  private routeChanged(route: string): void {
    ga('set', 'page', route);
    ga('send', 'pageview');
  }
}
