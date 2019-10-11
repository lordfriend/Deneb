import { HttpClient } from '@angular/common/http';
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {filter, take, mergeMap, catchError, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BaseService } from '../../../helpers/base.service';
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

    constructor(private _http: HttpClient,
                private _dialogService: UIDialog) {
        super()
    }

    /**
     * List web hook by user_id, actually this API will return all web_hook which user has a token associated with.
     * Note that the returned webhook is not exactly a webhook object. permissions is a string need deserialize by JSON.parse
     * @returns {Observable<WebHook[]>}
     */
    listWebHookToken(): Observable<WebHook[]> {
        return this._http.get<{ data: any[], total: number}>('/api/web-hook/token').pipe(
            map(res => res.data),
            map(webHookList => {
                return webHookList.map(webHook => {
                    if (webHook.permissions) {
                        webHook.permissions = JSON.parse(webHook.permissions as string) as string[];
                    } else {
                        webHook.permissions = []
                    }
                    webHook.permissions = webHook.permissions.map(perm_key => PERM_NAME[perm_key]);
                    return webHook;
                });
            }),
            catchError(this.handleError),);
    }

    addWebHookToken(querystring: string): Observable<any> {
        const params = new URLSearchParams(querystring);
        const token_id = params.get('token_id');
        const web_hook_id = params.get('web_hook_id');
        if (token_id && web_hook_id) {
            // TODO this API is not documented in the API document. We should properly document this API.
            return this._http.get<{ data: any }>(`/api/web-hook/${web_hook_id}`).pipe(
                map(res => {
                    let result = res.data;
                    result.permissions = JSON.parse(result.permissions);
                    return result as WebHook;
                }),
                catchError(this.handleError),
                mergeMap((webHook: WebHook) => {
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

                    return dialogRef.afterClosed().pipe(
                        take(1),
                        filter(result => result === 'confirm'),
                        mergeMap(() => {
                            return this._http.post<any>('/api/web-hook/token', null, {
                                params: {
                                    token_id: token_id,
                                    web_hook_id: web_hook_id
                                }
                            });
                        }),
                        catchError(this.handleError),);

                }),);
        } else {
            return observableThrowError(new BaseError('Illegal Parameters', '参数不合法'));
        }
    }

    deleteWebHookToken(web_hook_id: string): Observable<any> {
        return this._http.delete<any>('/api/web-hook/token', {
            params: {
                web_hook_id: web_hook_id
            }
        }).pipe(
            catchError(this.handleError),);
    }
}
