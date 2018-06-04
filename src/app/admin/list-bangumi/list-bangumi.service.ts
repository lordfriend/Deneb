import { Injectable } from '@angular/core';

@Injectable()
export class ListBangumiService {
    scrollPosition: number;
    orderBy: string;
    sort: string;
    type: number;
    isMovie: boolean;
}
