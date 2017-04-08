import {Pipe, PipeTransform} from '@angular/core';

export const STATUS = {
    0: 'Pending',
    1: 'On Air',
    2: 'Finished'
};

@Pipe({name: 'bangumiStatusName'})
export class BangumiStatusNamePipe implements PipeTransform {
    transform(value: number): any {
        return STATUS[value];
    }
}
