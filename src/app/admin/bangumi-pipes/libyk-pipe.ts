import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'libykFormat'})
export class LibykPipe implements PipeTransform {
    transform(value: string, key?: string): any {
        if (value) {
            let obj = JSON.parse(value);
            if (key) {
                return obj[key];
            }
            return `[${obj.t}] ${obj.q}`;
        }
        return '';
    }
}
