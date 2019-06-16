import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../helpers/base.service';
import { Bangumi } from '../../entity/bangumi';
import { Episode } from '../../entity/episode';

@Injectable()
export class TaskService extends BaseService {
    private _baseUrl = '/api/task';

    constructor(private _http: Http) {
        super();
    }

    listPendingDeleteBangumi(): Observable<{data: Bangumi[], delete_delay: number}> {
        return this._http.get(`${this._baseUrl}/bangumi`).pipe(
            map(res => res.json() as {data: Bangumi[], delete_delay: number}),
            catchError(this.handleError),);
    }

    listPendingDeleteEpisode(): Observable<{data: Episode[], delete_delay: number}> {
        return this._http.get(`${this._baseUrl}/episode`).pipe(
            map(res => res.json() as {data: Episode[], delete_delay: number}),
            catchError(this.handleError),);
    }

    restoreBangumi(bangumi_id: string): Observable<any> {
        return this._http.post(`${this._baseUrl}/restore/bangumi/${bangumi_id}`, null).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    restoreEpisode(episode_id: string): Observable<any> {
        return this._http.post(`${this._baseUrl}/restore/episode/${episode_id}`, null).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }
}
