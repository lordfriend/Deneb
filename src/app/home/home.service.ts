import {Injectable, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {BaseService} from "../../helpers/base.service";
import {Observable} from "rxjs/Observable";
import {Episode} from '../entity/episode';
import {Bangumi} from "../entity/bangumi";
import {Router, NavigationEnd} from '@angular/router';
import {homeRoutes} from './home.routes';
import {queryString} from '../../helpers/url'

@Injectable()
export class HomeService extends BaseService {

    private _baseUrl = '/api/home';

    constructor(private http: Http,
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

    watchProgressChanges: EventEmitter<string> = new EventEmitter<string>();

    favoriteChanges: EventEmitter<any> = new EventEmitter<any>();

    episodeWatching(bangumi_id: string) {
        this.watchProgressChanges.emit(bangumi_id);
    }

    changeFavorite() {
        this.favoriteChanges.emit(null);
    }

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
        return this.http.get(queryUrl)
            .map(res => <Episode[]> res.json().data)
            .catch(this.handleError);
    }

    onAir(type: number): Observable<Bangumi[]> {
        return this.http.get(`${this._baseUrl}/on_air?type=${type}`)
            .map(res => <Bangumi[]> res.json().data)
            .catch(this.handleError);
    }

    episode_detail(episode_id: string): Observable<Episode> {
        return this.http.get(`${this._baseUrl}/episode/${episode_id}`)
            .map(res => <Episode> res.json())
            .catch(this.handleError);
    }

    bangumi_datail(bangumi_id: string): Observable<Bangumi> {
        return this.http.get(`${this._baseUrl}/bangumi/${bangumi_id}`)
            .map(res => <Bangumi> res.json().data)
            .catch(this.handleError);
    }

    listBangumi(params: {name?: string, page: number, count: number, order_by: string, sort: string}): Observable<{ data: Bangumi[], total: number }> {
        let query = queryString(params);
        return this.http.get(`${this._baseUrl}/bangumi?${query}`)
            .map(res => res.json() as {data: Bangumi[], total: number})
            .catch(this.handleError);
    }

    myBangumi(): Observable<Bangumi[]> {
        return this.http.get(`${this._baseUrl}/my_bangumi`)
            .map(res => <Bangumi[]> res.json().data)
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
