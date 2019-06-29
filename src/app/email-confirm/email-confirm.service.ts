import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../helpers/base.service';

@Injectable()
export class EmailConfirmService extends BaseService {
    constructor(private _http: HttpClient) {
        super()
    }

    confirmEmail(querystring: string): Observable<any> {
        // URLSearchParams is a WHATWG spec
        let params = new URLSearchParams(querystring);
        let token = params.get('token');
        return this._http.post<any>('/api/user/email/confirm', {token: token}).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }
}
