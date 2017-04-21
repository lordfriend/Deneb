import {Pipe, PipeTransform} from '@angular/core';

export const BANGUMI_TYPES = {
    2: '动画',
    6: '电视剧'
};

@Pipe({name: 'bangumiTypeName'})
export class BangumiTypeNamePipe implements PipeTransform {

    transform(value: number | string): any {
        return BANGUMI_TYPES[value] || '未知类型';
    }
}
