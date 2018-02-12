import { Component, Input } from '@angular/core';
import { Bangumi } from '../../../entity';
import { Character } from '../interfaces';


@Component({
    selector: 'bangumi-character',
    templateUrl: './bangumi-character.html',
    styleUrls: ['./bangumi-character.less']
})
export class BangumiCharacterComponent {
    @Input()
    bangumi: Bangumi;
    @Input()
    characterList: Character[];
}
