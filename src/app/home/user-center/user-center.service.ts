import { Injectable } from '@angular/core';
import { BaseService } from '../../../helpers/base.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { WebHook } from '../../entity/web-hook';
import { UIDialog } from 'deneb-ui';
import { ConfirmDialogModal } from '../../confirm-dialog/confirm-dialog-modal.component';
import { BaseError } from '../../../helpers/error/BaseError';

@Injectable()
export class UserCenterService extends BaseService {

    constructor(private _http: Http,
                private _dialogService: UIDialog) {
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
        const web_hook_id = params.get('web_hook_id');
        const web_hook_name = params.get('web_hook_name');
        if (token_id && web_hook_id && web_hook_name) {
            const dialogRef = this._dialogService.open(ConfirmDialogModal, {stickyDialog: true, backdrop: true});
            dialogRef.componentInstance.title = '确定添加Web Hook吗？';
            dialogRef.componentInstance.content = `将要添加此Web Hook ${web_hook_name}, 该将以匿名的方式获取您的收藏信息。您可以随时删除该Web Hook。`;
            return dialogRef.afterClosed()
                .take(1)
                .filter(result => result === 'confirm')
                .flatMap(() => {
                    return this._http.post('/api/web-hook/token', null, {
                        params: {
                            token_id: token_id,
                            web_hook_id: web_hook_id
                        }
                    });
                })
                .map(res => res.json())
                .catch(this.handleError);
        } else {
            return Observable.throw(new BaseError('Illegal Parameters', '参数不合法'));
        }

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
