import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'parseJson'})
export class ParseJsonPipe implements PipeTransform {

    transform(json: string): any {
        try {
            return JSON.parse(json);
        } catch (e) {
            return [];
        }
    }
}
