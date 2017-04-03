import {Component, Input} from '@angular/core';
import {Bangumi} from '../../entity/bangumi';

require('./bangumi-card.less');

@Component({
    selector: 'bangumi-card',
    templateUrl: './bangumi-card.html'
})
export class BangumiCard {
    @Input()
    showAddedTag: boolean;

    @Input()
    bangumi: Bangumi;
}
