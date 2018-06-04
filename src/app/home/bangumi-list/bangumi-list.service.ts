import { Injectable } from '@angular/core';

@Injectable()
export class BangumiListService {
    scrollPosition = 0;
    sort: string;
    type: number;
    isMovie: boolean;
}
