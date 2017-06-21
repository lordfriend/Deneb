import { BaseService } from '../../helpers/base.service';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { PersistStorage } from '../user-service/persist-storage';

export const PREFIX = 'watch_history';

export const TASK_INTERVAL = 3 * 60 * 1000;

export interface WatchHistoryRecord {
    bangumi_id: string;
    episode_id: string;
    last_watch_position: number;
    last_watch_time: number;
    percentage: number;
    is_finished: boolean;
}

@Injectable()
export class WatchService extends BaseService {

    private _baseUrl = '/api/watch';

    private _requestOptions: RequestOptions;

    constructor(private _http: Http, private _persistStorage: PersistStorage) {
        super();
        let headers = new Headers({'Content-Type': 'application/json'});
        this._requestOptions = new RequestOptions({headers: headers});
        this.synchronizeWatchProgress();
        this.runPeriodTask();
    }

    favorite_bangumi(bangumi_id: string, status: number): Observable<any> {
        let body = JSON.stringify({status: status});
        return this._http.post(`${this._baseUrl}/favorite/bangumi/${bangumi_id}`, body, this._requestOptions)
            .map(res => res.json())
            .catch(this.handleError)
    }

    episode_history(bangumi_id: string, episode_id: string, last_watch_position: number, percentage: number, is_finished: boolean): Observable<any> {
        let body = JSON.stringify({
            bangumi_id: bangumi_id,
            last_watch_position: last_watch_position,
            is_finished: is_finished,
            percentage: percentage
        });
        return this._http.post(`${this._baseUrl}/history/${episode_id}`, body, this._requestOptions)
            .map(res => res.json())
            .catch(this.handleError)
    }

    updateWatchProgress(bangumi_id: string, episode_id: string, last_watch_position: number, percentage: number, is_finished: boolean): void {
        this._persistStorage.setItem(`${PREFIX}:${episode_id}`, JSON.stringify({
            bangumi_id: bangumi_id,
            episode_id: episode_id,
            last_watch_position: last_watch_position,
            last_watch_time: Date.now(),
            is_finished: is_finished,
            percentage: percentage
        }));
    }

    getLocalWatchHistory(episode_id: string): WatchHistoryRecord | null {
        let recordStr = this._persistStorage.getItem(`${PREFIX}:${episode_id}`, null);
        if (recordStr) {
            return JSON.parse(recordStr);
        }
        return null;
    }

    private synchronizeWatchProgress(): void {
        let iterator = this._persistStorage.iterator();
        let watchHistoryRecords: WatchHistoryRecord[] = [];
        for (let result = iterator.next(); !result.done; result = iterator.next()) {
            let entry = result.value;
            if(this._persistStorage.startsWith(entry.key, PREFIX) && entry.value) {
                watchHistoryRecords.push(JSON.parse(entry.value));
            }
        }
        if (watchHistoryRecords.length === 0) {
            return;
        }
        let body = JSON.stringify({
            records: watchHistoryRecords
        });
        this._http.post(`${this._baseUrl}/history/synchronize`, body, this._requestOptions)
            .map(res => res.json())
            .catch(this.handleError)
            .subscribe(() => {
                watchHistoryRecords.forEach(record => {
                    let key = `${PREFIX}:${record.episode_id}`;
                    let recordInStorageStr = this._persistStorage.getItem(key, null);
                    if (recordInStorageStr) {
                        let recordInStorage = JSON.parse(recordInStorageStr);
                        if (recordInStorage.last_watch_time === record.last_watch_time) {
                            // we delete same records because they are not updated.
                            this._persistStorage.removeItem(key);
                        }
                    }
                });
            }, (error) => {
                console.log(error);
            });
    }

    runPeriodTask() {
        setInterval(() => {
            console.log('synchronize history records');
            this.synchronizeWatchProgress();
        }, TASK_INTERVAL);
    }
}
