import {Injectable, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {BaseService} from "../services/base.service";
import {Observable} from "rxjs/Observable";
import {Episode} from '../entity/episode';
import {Bangumi} from "../entity/bangumi";
import {Router, NavigationEnd} from '@angular/router';
import {homeRoutes} from './home.routes';

@Injectable()
export class HomeService extends BaseService {

  private _baseUrl = '/api/home';

  constructor(private _http: Http,
              private router: Router) {
    super();
    let childRoutes = homeRoutes[0].children;
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationEnd) {
          let urlSegements = this.parseUrl(event.url);
          if (urlSegements.paths[0] === '') {
            this.childRouteChanges.emit('Default');
          } else if (urlSegements.paths[0] === 'play') {
            this.childRouteChanges.emit('Play');
          } else if (urlSegements.paths.length === 1 && urlSegements.paths[0] === 'bangumi') {
            this.childRouteChanges.emit('Bangumi');
          } else if (urlSegements.paths.length === 2 && urlSegements.paths[0] === 'bangumi') {
            this.childRouteChanges.emit('BangumiDetail');
          }
        }
      }
    )
  }

  private parseUrl(url: string) {
    let [paths, queryStrings] = url.split(';');
    let pathSegement = paths.split('/');
    return {
      paths: pathSegement.slice(1),
      queryString: queryStrings
    }
  }

  childRouteChanges: EventEmitter<any> = new EventEmitter();

  /**
   * @Deprecated
   */
  activateChild(routeName: string) {
    this.childRouteChanges.emit(routeName);
  }

  recentEpisodes(days?: number): Observable<Episode[]> {
    let queryUrl = this._baseUrl + '/recent';
    if (days) {
      queryUrl = queryUrl + '?days=' + days;
    }
    return this._http.get(queryUrl)
      .map(res => <Episode[]> res.json().data)
      .catch(this.handleError);
  }

  onAir(): Observable<Bangumi[]> {
    let queryUrl = this._baseUrl + '/on_air';
    return this._http.get(queryUrl)
      .map(res => <Bangumi[]> res.json().data)
      .catch(this.handleError);
  }

  episode_detail(episode_id: string): Observable<Episode> {
    let queryUrl = this._baseUrl + '/episode/' + episode_id;
    return this._http.get(queryUrl)
      .map(res => <Episode> res.json())
      .catch(this.handleError);
  }

  bangumi_datail(bangumi_id: string): Observable<Bangumi> {
    let queryUrl = this._baseUrl + '/bangumi/' + bangumi_id;
    return this._http.get(queryUrl)
      .map(res => <Bangumi> res.json().data)
      .catch(this.handleError);
  }

  listBangumi(page: number, orderBy: string, name?: string): Observable<any> {
    let queryUrl = this._baseUrl + '/bangumi?page=' + page + '&order_by=' + orderBy;
    if (name) {
      queryUrl = queryUrl + '&name=' + name;
    }
    return this._http.get(queryUrl)
      .map(res => res.json())
      .catch(this.handleError);
  }
}

/**
 * Communicate between Home Component and its children
 */
export abstract class HomeChild {

  constructor(protected homeService: HomeService) {

  }

}
