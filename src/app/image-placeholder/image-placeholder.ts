import {Component, Input, ViewEncapsulation} from '@angular/core';


@Component({
    selector: 'ui-image-placeholder',
    template: `
        <div class="image-wrapper" [ngClass]="status">
            <img [src]="imageUrl" alt="" (load)="onLoad()" (error)="onError()">
            <ng-content select=".ui-image-fallback"></ng-content>
        </div>
    `,
    styleUrls: ['./ui-image-placeholder.less'],
    encapsulation: ViewEncapsulation.None
})
export class UIImagePlaceholder {

    private STATUS_LOADED = 'loaded';
    private STATUS_FALLBACK = 'fallback';

    status: string = this.STATUS_FALLBACK;

    @Input()
    imageUrl: string;

    onLoad(): boolean {
        this.status = this.STATUS_LOADED;
        return false;
    }

    onError(): boolean {
        this.status = this.STATUS_FALLBACK;
        return false;
    }

}
