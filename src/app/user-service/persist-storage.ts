import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { storageAPI } from '../../helpers/localstorage';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export const PREFIX = 'ps';

@Injectable()
export class PersistStorage {
    private _itemChange = new Subject<{key: string, value: string}>();

    constructor(private _userService: UserService) {
        this._userService.getUserInfo()
            .subscribe((user) => {
                if (!user) {
                    this.clear();
                }
            })
    }

    setItem(key: string, value: string) {
        let keyInStorage = `${PREFIX}:${key}`;
        storageAPI.setItem(keyInStorage, value);
        this._itemChange.next({key, value});
    }

    getItem(key: string, defaultValue: string | null): string {
        let keyInStorage = `${PREFIX}:${key}`;
        let value = storageAPI.getItem(keyInStorage);
        return value !== null ? value: defaultValue;
    }

    subscribe(key: string): Observable<string> {
        return this._itemChange.asObservable()
            .filter((item) => {
                return item.key === key;
            })
            .map(({value}) => {
                return value;
            })
            .distinctUntilChanged();
    }

    private clear() {
        for (let i = 0; i < storageAPI.length; i++) {
            let key = storageAPI.key(i);
            if (key.startsWith(PREFIX)) {
                storageAPI.removeItem(key);
                i--;
            }
        }
    }
}
