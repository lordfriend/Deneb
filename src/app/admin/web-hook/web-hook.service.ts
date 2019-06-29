import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../helpers/base.service';
import { WebHook } from '../../entity/web-hook';

@Injectable()
export class WebHookService extends BaseService {
    private _baseUrl = '/api/web-hook';

    constructor(private _http: HttpClient) {
        super();
    }

    /**
     * list all Web hooks, we use any as data's type because it's actually not exactly the same data type as WebHook,
     * permission is a string which should be further processed to string array.
     * @returns {Observable<WebHook[]>}
     */
    listWebHook(): Observable<WebHook[]> {
        return this._http.get<{data: any[], total: number}>(`${this._baseUrl}/`).pipe(
            map((res) => {
                return res.data.map(webHook => {
                    if (webHook.permissions) {
                        webHook.permissions = JSON.parse(webHook.permissions as string) as string[];
                    } else {
                        webHook.permissions = []
                    }
                    return webHook as WebHook;
                });
            }),
            catchError(this.handleError),);
    }

    registerWebHook(webHook: any): Observable<any> {
        webHook.permissions = JSON.stringify(webHook.permissions);
        return this._http.post<any>(`${this._baseUrl}/register`, webHook).pipe(
            catchError(this.handleError),);
    }

    updateWebHook(webHookId: string, webHook: any): Observable<any> {
        webHook.permissions = JSON.stringify(webHook.permissions);
        return this._http.put<any>(`${this._baseUrl}/${webHookId}`, webHook).pipe(
            catchError(this.handleError),);
    }

    deleteWebHook(webHookId: string): Observable<any> {
        return this._http.delete<any>(`${this._baseUrl}/${webHookId}`).pipe(
            catchError(this.handleError),);
    }
}
