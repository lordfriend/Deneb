import {BaseService} from '../../../helpers/base.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Bangumi} from '../../entity/bangumi';
import {Http} from '@angular/http';
import {Episode} from '../../entity/episode';

@Injectable()
export class TaskService extends BaseService {
    private _baseUrl = '/api/task';

    constructor(private _http: Http) {
        super();
    }

    listPendingDeleteBangumi(): Observable<{data: Bangumi[], delete_delay: number}> {
        return this._http.get(`${this._baseUrl}/bangumi`)
            .map(res => res.json() as {data: Bangumi[], delete_delay: number})
            .catch(this.handleError);
    }

    listPendingDeleteEpisode(): Observable<{data: Episode[], delete_delay: number}> {
        return this._http.get(`${this._baseUrl}/episode`)
            .map(res => res.json() as {data: Episode[], delete_delay: number})
            .catch(this.handleError);
    }

    restoreBangumi(bangumi_id: string): Observable<any> {
        return this._http.post(`${this._baseUrl}/restore/bangumi/${bangumi_id}`, null)
            .map(res => res.json())
            .catch(this.handleError);
    }

    restoreEpisode(episode_id: string): Observable<any> {
        return this._http.post(`${this._baseUrl}/restore/episode/${episode_id}`, null)
            .map(res => res.json())
            .catch(this.handleError);
    }
}
