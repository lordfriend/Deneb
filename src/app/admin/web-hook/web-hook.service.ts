import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../helpers/base.service';
import { WebHook } from '../../entity/web-hook';

@Injectable()
export class WebHookService extends BaseService {
    private _baseUrl = '/api/web-hook';

    constructor(private _http: Http) {
        super();
    }

    listWebHook(): Observable<WebHook[]> {
        return this._http.get(`${this._baseUrl}/`).pipe(
            map((res) => {
                return (res.json().data as any[]).map(webHook => {
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
        let header = new Headers({'Content-Type': 'application/json;utf-8'});
        let requestOptions = new RequestOptions({headers: header});
        webHook.permissions = JSON.stringify(webHook.permissions);
        let body = JSON.stringify(webHook);
        return this._http.post(`${this._baseUrl}/register`, body, requestOptions).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    updateWebHook(webHookId: string, webHook: any): Observable<any> {
        let header = new Headers({'Content-Type': 'application/json;utf-8'});
        let requestOptions = new RequestOptions({headers: header});
        webHook.permissions = JSON.stringify(webHook.permissions);
        let body = JSON.stringify(webHook);
        return this._http.put(`${this._baseUrl}/${webHookId}`, body, requestOptions).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    deleteWebHook(webHookId: string): Observable<any> {
        return this._http.delete(`${this._baseUrl}/${webHookId}`).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }
}
