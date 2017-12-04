import { Component, Input, ViewEncapsulation } from '@angular/core';
import { WebHook } from '../../../entity/web-hook';

@Component({
    selector: 'web-hook-card',
    templateUrl: './web-hook-card.html',
    styleUrls: ['./web-hook-card.less'],
    encapsulation: ViewEncapsulation.None
})
export class WebHookCardComponent {
    @Input()
    webHook: WebHook;

    onClickId(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }
}
