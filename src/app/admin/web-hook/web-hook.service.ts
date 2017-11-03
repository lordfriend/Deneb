import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { BaseService } from '../../../helpers/base.service';
import { Observable } from 'rxjs/Observable';
import { WebHook } from '../../entity/web-hook';

@Injectable()
export class WebHookService extends BaseService {
    private _baseUrl = '/api/web-hook';

    constructor(private _http: Http) {
        super();
    }

    listWebHook(): Observable<WebHook[]> {
        return this._http.get(`${this._baseUrl}/`)
            .map(res => res.json().data as WebHook[])
            .catch(this.handleError);
    }

    registerWebHook(webHook: any): Observable<any> {
        let header = new Headers({'Content-Type': 'application/json;utf-8'});
        let requestOptions = new RequestOptions({headers: header});
        let body = JSON.stringify(webHook);
        return this._http.post(`${this._baseUrl}/register`, body, requestOptions)
            .map(res => res.json())
            .catch(this.handleError);
    }

    updateWebHook(webHookId: string, webHook: any): Observable<any> {
        let header = new Headers({'Content-Type': 'application/json;utf-8'});
        let requestOptions = new RequestOptions({headers: header});
        let body = JSON.stringify(webHook);
        return this._http.put(`${this._baseUrl}/${webHookId}`, body, requestOptions)
            .map(res => res.json())
            .catch(this.handleError);
    }

    deleteWebHook(webHookId: string): Observable<any> {
        return this._http.delete(`${this._baseUrl}/${webHookId}`)
            .map(res => res.json())
            .catch(this.handleError);
    }
}
