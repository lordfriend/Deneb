import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../helpers/base.service';

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
        return this._http.post('/api/user/email/confirm', body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }
}
