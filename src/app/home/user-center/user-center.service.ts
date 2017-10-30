import { Injectable } from '@angular/core';
import { BaseService } from '../../../helpers/base.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { WebHook } from '../../entity/web-hook';

@Injectable()
export class UserCenterService extends BaseService {

    constructor(private _http: Http) {
        super()
    }

    listWebHookToken(): Observable<WebHook[]> {
        return this._http.get('/api/web-hook/token')
            .map(res => res.json().data)
            .catch(this.handleError);
    }

    addWebHookToken(querystring: string): Observable<any> {
        const params = new URLSearchParams(querystring);
        const token_id = params.get('token_id');
        const web_hook_id = params.get('web_hook_id')
        return this._http.post('/api/web-hook/token', null, {
            params: {
                token_id: token_id,
                web_hook_id: web_hook_id
            }
        })
            .map(res => res.json())
            .catch(this.handleError);
    }

    deleteWebHookToken(web_hook_id: string): Observable<any> {
        return this._http.delete('/api/web-hook/token', {
            params: {
                web_hook_id: web_hook_id
            }
        })
            .map(res => res.json())
            .catch(this.handleError);
    }
}
