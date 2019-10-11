import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UIToastComponent, UIToastRef } from 'deneb-ui';
import { Observable } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { BaseService } from "../../helpers/base.service";
// import {homeRoutes} from './home.routes';
import { queryString } from '../../helpers/url'
import { Bangumi, Episode } from "../entity";
import { Announce } from '../entity/announce';
import { WatchProgress } from "../entity/watch-progress";
import { WatchService } from './watch.service';

@Injectable()
export class HomeService extends BaseService {

    private _baseUrl = '/api/home';
    private _toastRef: UIToastRef<UIToastComponent>;

    constructor(private _http: HttpClient,
                private _router: Router,
                private _watchService: WatchService,) {
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
                    } else if (urlSegements.paths[0] === 'favorite') {
                        this.childRouteChanges.emit('Favorite');
                    }
                }
            }
        );
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

    favoriteChecked: EventEmitter<{bangumi_id: string, check_time: number}> = new EventEmitter<{bangumi_id: string, check_time: number}>();

    checkFavorite(bangumi_id: string) {
        this._watchService.check_favorite(bangumi_id)
            .subscribe((data) => {
                this.favoriteChecked.emit({bangumi_id: bangumi_id, check_time: data.data});
                console.log(`bangumi ${bangumi_id} checked`);
            }, (error) => {
                console.log(error);
            });
    }

    /**
     * @Deprecated
     */
    activateChild(routeName: string) {
        this.childRouteChanges.emit(routeName);
    }

    /**
     * recently updated, not used
     * @param {number} days
     * @returns {Observable<Episode[]>}
     */
    recentEpisodes(days?: number): Observable<Episode[]> {
        let queryUrl = this._baseUrl + '/recent';
        if (days) {
            queryUrl = queryUrl + '?days=' + days;
        }
        return this._http.get<{ data: Episode[] }>(queryUrl).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }

    /**
     * All on air Bangumi
     * @param {number} type
     * @returns {Observable<Bangumi[]>}
     */
    onAir(type: number): Observable<Bangumi[]> {
        return this._http.get<{ data: Bangumi[] }>(`${this._baseUrl}/on_air?type=${type}`).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }

    episode_detail(episode_id: string): Observable<Episode> {
        return this._http.get<Episode>(`${this._baseUrl}/episode/${episode_id}`).pipe(
            map(episode => this.synchronizeWatchProgressWithLocal(episode)),
            catchError(this.handleError),);
    }

    bangumi_detail(bangumi_id: string): Observable<Bangumi> {
        return this._http.get<{ data: Bangumi }>(`${this._baseUrl}/bangumi/${bangumi_id}`).pipe(
            map(res => res.data),
            map(bangumi => {
                bangumi.episodes = bangumi.episodes.map(episode => this.synchronizeWatchProgressWithLocal(episode));
                return bangumi;
            }),
            catchError(this.handleError),);
    }

    listBangumi(params: {
        name?: string,
        page: number,
        count: number,
        order_by: string,
        sort: string,
        type?: number}): Observable<{ data: Bangumi[], total: number }> {
        let query = queryString(params);
        return this._http.get<{ data: Bangumi[], total: number }>(`${this._baseUrl}/bangumi?${query}`).pipe(
            catchError(this.handleError),);
    }

    myBangumi(status: number): Observable<Bangumi[]> {
        return this._http.get<{data: Bangumi[]}>(`${this._baseUrl}/my_bangumi?status=${status}`).pipe(
            map(res => <Bangumi[]> res.data),
            catchError(this.handleError),);
    }

    listAnnounce(): Observable<Announce[]> {
        return this._http.get<{data: Announce[]}>(`${this._baseUrl}/announce`).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }

    sendFeedback(episode_id: string, video_file_id: string, message: string): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/feedback`, {
            episode_id: episode_id,
            video_file_id: video_file_id,
            message: message
        }).pipe(
            catchError(this.handleError),);
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
