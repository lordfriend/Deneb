import {Component, Input, ViewEncapsulation} from '@angular/core';
import {Bangumi} from '../../entity/bangumi';

export const CARD_HEIGHT_REM = 16;

@Component({
    selector: 'bangumi-card',
    templateUrl: './bangumi-card.html',
    styleUrls: ['./bangumi-card.less'],
    encapsulation: ViewEncapsulation.None
})
export class BangumiCard {
    @Input()
    showAddedTag: boolean;

    @Input()
    bangumi: Bangumi;
}
