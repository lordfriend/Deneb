import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { isChrome, isEdge, isFirefox } from '../../helpers/browser-detect';

const MESSAGE_TYPE_EXT = 'SADR_FROM_EXT';
const MESSAGE_TYPE_PAGE = 'SADR_FROM_PAGE';

export interface RPCMessage {
    extensionId: string;
    id: number;
    className: string;
    method: string;
    args: any[];
    type?: string;
}

export interface RPCResult {
    extensionId: string;
    messageId: number;
    error: any | null;
    result: any | null;
    type?: string;
}

class MessageStub {
    private readonly timerId: number;

    constructor(public message: RPCMessage, private timeout: number, private callback: (err: Error, event: RPCResult) => void) {
        this.timerId = window.setTimeout(() => {
            clearTimeout(this.timerId);
            callback(new Error('time out'), null);
        }, this.timeout);
    }

    respond(event: RPCResult) {
        clearTimeout(this.timerId);
        this.callback(null, event);
    }
}

@Injectable()
export class ExtensionRpcService {
    get extensionId(): any {
        return this._extensionId;
    }
    private messageMap = new Map<number, MessageStub>();
    private _ID = 0;
    private defaultTimeout = 30000;
    private readonly _extensionId = null;

    constructor(private _ngZone: NgZone) {
        if (isFirefox) {
            this._extensionId = FIREFOX_EXTENSION_ID;
        } else if (isChrome) {
            this._extensionId = CHROME_EXTENSION_ID;
        } else if (isEdge) {
            this._extensionId = EDGE_EXTENSION_ID;
        }

        window.addEventListener('message', (event: MessageEvent) => {
            let result = event.data as RPCResult;
            if (result.extensionId !== this._extensionId || result.type !== MESSAGE_TYPE_EXT) {
                return false;
            }
            let messageStub = this.messageMap.get(result.messageId);
            if (messageStub) {
                messageStub.respond(result);
            }
        }, false);
    }

    isExtensionEnabled(): boolean {
        // console.log(!!window && !!this._extensionId);
        return !!window && !!this._extensionId;
    }

    invokeRPC(className: string, method: string, args: any[], timeout: number = this.defaultTimeout): Observable<any> {
        let messageId = this._ID++;
        let message: RPCMessage = {
            extensionId: this._extensionId,
            id: messageId,
            className: className,
            method: method,
            args: args,
            type: MESSAGE_TYPE_PAGE
        };
        return new Observable<any>((observer) => {
            let messageStub = new MessageStub(message, timeout, (err, event) => {
                this._ngZone.run(() => {
                    if (err || !event) {
                        observer.error(err ? err : 'Unknown Error');
                    } else if (event && event.error) {
                        observer.error(event.error);
                    } else {
                        observer.next(event.result);
                    }
                    observer.complete();
                });
                this.messageMap.delete(messageId);
            });
            window.postMessage(message, "*");
            this.messageMap.set(messageId, messageStub);
        });
    }
}
