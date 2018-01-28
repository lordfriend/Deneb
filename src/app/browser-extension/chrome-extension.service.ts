import { ApplicationRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UIDialog } from 'deneb-ui';
import { BangumiAuthDialogComponent } from './bangumi-auth-dialog/bangumi-auth-dialog.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import Port = chrome.runtime.Port;

export interface RPCMessage {
    className: string;
    method: string;
    args: any[];
}

export interface RPCResult {
    error: any | null;
    result: any | null;
}


export interface IAuthInfo {
    id: string; // user's uid
    url: string; // user url
    username: string; // user's uid, wtf
    nickname: string;
    avatar: {
        large: string, // large image url
        medium: string, // medium image url
        small: string // small image url
    },
    sign: string,
    auth: string, // issued by auth server, used in ${AUTH_TOKEN}
    auth_encode?: string // ${AUTH_TOKEN) encoded by urlencode()
}
export type INITIAL_STATE = 0;
export type AuthInfo = IAuthInfo | null | INITIAL_STATE;

export const INITIAL_STATE_VALUE = 0;

export enum LOGON_STATUS {
    UNSURE, TRUE, FALSE
}


@Injectable()
export class ChromeExtensionService {

    private _authInfo = new BehaviorSubject<AuthInfo>(INITIAL_STATE_VALUE);
    private _isBgmTvLogon = new BehaviorSubject<LOGON_STATUS>(LOGON_STATUS.UNSURE);

    isEnabled: Promise<boolean>;
    chromeExtensionId: string;

    get authInfo(): Observable<AuthInfo> {
        return this._authInfo.asObservable();
    }

    get isBgmTvLogon(): Observable<LOGON_STATUS> {
        return this._isBgmTvLogon.asObservable();
    }

    constructor(private _appRef: ApplicationRef) {
        console.log('chrome extension id:', CHROME_EXTENSION_ID);
        if (CHROME_EXTENSION_ID) {
            this.chromeExtensionId = CHROME_EXTENSION_ID;
        }
        if (window && chrome && this.chromeExtensionId) {
            this.isEnabled = new Promise<boolean>((resolve, reject) => {
                chrome.runtime.sendMessage(this.chromeExtensionId, {
                    className: 'BackgroundCore',
                    method: 'verify',
                    args: []
                }, (resp) => {
                    console.log(resp);
                    if (resp && resp.result === 'OK') {
                        resolve(true);
                        this.invokeBangumiMethod('getAuthInfo', [])
                            .then(authInfo => {
                                console.log(authInfo);
                                this._authInfo.next(authInfo);
                                this._appRef.tick();
                            });
                        this.invokeBangumiWebMethod('checkLoginStatus', [])
                            .then(result => {
                                console.log(result);
                                if (result.isLogin) {
                                    this._isBgmTvLogon.next(LOGON_STATUS.TRUE);
                                } else {
                                    this._isBgmTvLogon.next(LOGON_STATUS.FALSE);
                                }
                                this._appRef.tick();
                            });
                    } else {
                        reject('connection error, upgrade your extension');
                    }
                });
            });
        } else {
            this.isEnabled = Promise.resolve(false);
        }
    }

    invokeBangumiMethod(method: string, args: any[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            chrome.runtime.sendMessage(this.chromeExtensionId, {
                className: 'BangumiAPIProxy',
                method: method,
                args: args
            }, (resp: RPCResult) => {
                if (resp && !resp.error) {
                    resolve(resp.result);
                } else {
                    reject(resp ? resp.error : 'unknown error');
                }
            });
        });
    }

    invokeBangumiWebMethod(method: string, args: any[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            chrome.runtime.sendMessage(this.chromeExtensionId, {
                className: 'BangumiWebProxy',
                method: method,
                args: args
            }, (resp: RPCResult) => {
                if (resp && !resp.error) {
                    resolve(resp.result);
                } else {
                    reject(resp ? resp.error : 'unknown error');
                }
            });
        });
    }

    auth(username: string, password: string): Promise<any> {
        return this.invokeBangumiMethod('auth', [username, password])
            .then(data => {
                this._authInfo.next(data);
                return data;
            });
    }

    openBgmForResult(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            chrome.runtime.sendMessage(this.chromeExtensionId, {
                className: 'BackgroundCore',
                method: 'openBgmForResult'
            }, (resp: RPCResult) => {
                if (resp && !resp.error) {
                    resolve(resp.result);
                } else {
                    reject(resp ? resp.error: 'unknown error');
                }
            });
        })
            .then(() => {
                this._isBgmTvLogon.next(LOGON_STATUS.TRUE);
                this._appRef.tick();
            })
    }

    revokeAuth(): Promise<any> {
        return this.invokeBangumiMethod('revokeAuth', [])
            .then((result) => {
                this._authInfo.next(null);
                return result;
            });
    }

}
