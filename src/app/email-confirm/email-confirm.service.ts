import { Injectable } from '@angular/core';
import { BaseService } from '../../helpers/base.service';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EmailConfirmService extends BaseService {
    constructor(private _http: Http) {
        super()
    }

    confirmEmail(querystring: string): Observable<any> {
        let params = new URLSearchParams(querystring);
        let token = params.get('token');
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({token: token});
        return this._http.post('/api/user/email/confirm', body, options)
            .map(res => res.json())
            .catch(this.handleError);
    }
}
