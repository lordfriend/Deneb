import { Component } from '@angular/core';
@Component({
    selector: 'video-fullscreen-button',
    template: `<i class="icon" [ngClass]="iconClass"></i>`
})
export class VideoFullscreenButton {
    iconClass: string;
}
