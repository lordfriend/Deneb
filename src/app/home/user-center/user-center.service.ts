import { Injectable } from '@angular/core';
import { BaseService } from '../../../helpers/base.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { PERM_NAME, WebHook } from '../../entity/web-hook';
import { UIDialog } from 'deneb-ui';
import { ConfirmDialogModal } from '../../confirm-dialog/confirm-dialog-modal.component';
import { BaseError } from '../../../helpers/error/BaseError';

const PERMISSION_INFO = {
    [WebHook.PERMISSION_FAVORITE]: '用户的收藏信息',
    [WebHook.PERMISSION_EMAIL]: '用户的邮箱地址'
};

@Injectable()
export class UserCenterService extends BaseService {

    constructor(private _http: Http,
                private _dialogService: UIDialog) {
        super()
    }

    listWebHookToken(): Observable<WebHook[]> {
        return this._http.get('/api/web-hook/token')
            .map(res => res.json().data)
            .map(webHookList => {
                return webHookList.map(webHook => {
                    if (webHook.permissions) {
                        webHook.permissions = JSON.parse(webHook.permissions as string) as string[];
                    } else {
                        webHook.permissions = []
                    }
                    webHook.permissions = webHook.permissions.map(perm_key => PERM_NAME[perm_key]);
                    return webHook;
                });
            })
            .catch(this.handleError);
    }

    addWebHookToken(querystring: string): Observable<any> {
        const params = new URLSearchParams(querystring);
        const token_id = params.get('token_id');
        const web_hook_id = params.get('web_hook_id');
        if (token_id && web_hook_id) {
            return this._http.get(`/api/web-hook/${web_hook_id}`)
                .map(res => {
                    let result = res.json().data as any;
                    result.permissions = JSON.parse(result.permissions);
                    return result as WebHook;
                })
                .catch(this.handleError)
                .flatMap((webHook: WebHook) => {
                    let permissionInfo = '<div>该WebHook将会需要以下权限</div><ul>' + webHook.permissions.map((permission_key) => {
                        return `<li>${PERMISSION_INFO[permission_key]}</li>`;
                    }).join('') + '</ul>';
                    let content = `<div>将要添加此Web Hook ${webHook.name}。您可以随时删除该Web Hook。</div>`;
                    if (webHook.permissions && webHook.permissions.length > 0) {
                        content += permissionInfo;
                    }
                    console.log(content);
                    const dialogRef = this._dialogService.open(ConfirmDialogModal, {
                        stickyDialog: true,
                        backdrop: true
                    });
                    dialogRef.componentInstance.title = '确定添加Web Hook吗？';
                    dialogRef.componentInstance.content = content;

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

                });
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
