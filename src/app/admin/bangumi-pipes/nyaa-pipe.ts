import { Pipe, PipeTransform } from '@angular/core';

export const AVAILABLE_FILTER = ['No filter', 'No remakes', 'Trusted only'];
export const AVAILABLE_CATEGORY = {'1_2': 'Anime - English-translated', '1_3': 'Anime - Non-English-translated', '1_4': 'Anime - Raw'};

@Pipe({name: 'NyaaPipe'})
export class NyaaPipe implements PipeTransform {

    transform(value: string, key: string): any {
        if (value) {
            let params = new URLSearchParams(value);
            let v = params.get(key);
            if (key === 'f') {
                return AVAILABLE_FILTER[v];
            } else if (key === 'c') {
                return AVAILABLE_CATEGORY[v];
            }
            return v;
        }
        return '';
    }
}
