import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'bangumiMoe'})
export class BangumiMoePipe implements PipeTransform {

    transform(json: string): any {
        try {
            return JSON.parse(json);
        } catch (e) {
            return [];
        }
    }
}
