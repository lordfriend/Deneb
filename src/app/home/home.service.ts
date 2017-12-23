import {Injectable, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {BaseService} from "../../helpers/base.service";
import {Observable} from "rxjs/Observable";
import {Episode} from '../entity/episode';
import {Bangumi} from "../entity/bangumi";
import {Router, NavigationEnd} from '@angular/router';
// import {homeRoutes} from './home.routes';
import {queryString} from '../../helpers/url'
import { WatchService } from './watch.service';
import { WatchProgress } from "../entity/watch-progress";
import { Announce } from '../entity/announce';

@Injectable()
export class HomeService extends BaseService {

    private _baseUrl = '/api/home';

    constructor(private _http: Http,
                private _router: Router,
                private _watchService: WatchService) {
        super();
        // let childRoutes = homeRoutes[0].children;
        this._router.events.subscribe(
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
                    } else if (urlSegements.paths[0] === 'pv') {
                        this.childRouteChanges.emit('PV');
                    }
                }
            }
        )
    }

    private parseUrl(url: string) {
        let [paths, queryStrings] = url.split(/[;?]/);
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
        return this._http.get(queryUrl)
            .map(res => <Episode[]> res.json().data)
            .catch(this.handleError);
    }

    onAir(type: number): Observable<Bangumi[]> {
        return this._http.get(`${this._baseUrl}/on_air?type=${type}`)
            .map(res => <Bangumi[]> res.json().data)
            .catch(this.handleError);
    }

    episode_detail(episode_id: string): Observable<Episode> {
        return this._http.get(`${this._baseUrl}/episode/${episode_id}`)
            .map(res => <Episode> res.json())
            .map(episode => this.synchronizeWatchProgressWithLocal(episode))
            .catch(this.handleError);
    }

    bangumi_datail(bangumi_id: string): Observable<Bangumi> {
        return this._http.get(`${this._baseUrl}/bangumi/${bangumi_id}`)
            .map(res => <Bangumi> res.json().data)
            .map(bangumi => {
                bangumi.episodes = bangumi.episodes.map(episode => this.synchronizeWatchProgressWithLocal(episode));
                return bangumi;
            })
            .catch(this.handleError);
    }

    listBangumi(params: {
        name?: string,
        page: number,
        count: number,
        order_by: string,
        sort: string,
        type?: number}): Observable<{ data: Bangumi[], total: number }> {
        let query = queryString(params);
        return this._http.get(`${this._baseUrl}/bangumi?${query}`)
            .map(res => res.json() as {data: Bangumi[], total: number})
            .catch(this.handleError);
    }

    myBangumi(status: number): Observable<Bangumi[]> {
        return this._http.get(`${this._baseUrl}/my_bangumi?status=${status}`)
            .map(res => <Bangumi[]> res.json().data)
            .catch(this.handleError);
    }

    listAnnounce():  Observable<Announce[]> {
        return this._http.get(`${this._baseUrl}/announce`)
            .map(res => res.json().data as Announce[])
            .catch(this.handleError);
    }

    private synchronizeWatchProgressWithLocal(episode: Episode): Episode {
        let record = this._watchService.getLocalWatchHistory(episode.id);
        if (record && (!episode.watch_progress || record.last_watch_time > episode.watch_progress.last_watch_time)) {
            if (!episode.watch_progress) {
                episode.watch_progress = new WatchProgress();
            }
            episode.watch_progress.last_watch_time = record.last_watch_time;
            episode.watch_progress.last_watch_position = record.last_watch_position;
            episode.watch_progress.percentage = record.percentage;
            episode.watch_progress.watch_status = record.is_finished ? WatchProgress.WATCHED : WatchProgress.WATCHING;
        }
        return episode;
    }
}

/**
 * Communicate between Home Component and its children
 */
export abstract class HomeChild {

    constructor(protected homeService: HomeService) {

    }

}
