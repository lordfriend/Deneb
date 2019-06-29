import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../helpers/base.service';
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

    constructor(private _http: HttpClient, private _persistStorage: PersistStorage) {
        super();
        this.synchronizeWatchProgress();
        this.runPeriodTask();
    }

    favorite_bangumi(bangumi_id: string, status: number): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/favorite/bangumi/${bangumi_id}`, {status: status}).pipe(
            catchError(this.handleError),);
    }

    delete_favorite(bangumi_id: string): Observable<any> {
        return this._http.delete<any>(`${this._baseUrl}/favorite/bangumi/${bangumi_id}`).pipe(
            catchError(this.handleError),);
    }

    check_favorite(bangumi_id: string): Observable<any> {
        return this._http.put<any>(`${this._baseUrl}/favorite/check/${bangumi_id}`, null).pipe(
            catchError(this.handleError),);
    }

    episode_history(bangumi_id: string, episode_id: string, last_watch_position: number, percentage: number, is_finished: boolean): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/history/${episode_id}`, {
            bangumi_id: bangumi_id,
            last_watch_position: last_watch_position,
            is_finished: is_finished,
            percentage: percentage
        }).pipe(
            catchError(this.handleError),)
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
        this._http.post<any>(`${this._baseUrl}/history/synchronize`, {
            records: watchHistoryRecords
        }).pipe(
            catchError(this.handleError),)
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
