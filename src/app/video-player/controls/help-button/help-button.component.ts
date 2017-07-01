import { Component, HostListener } from '@angular/core';
import { UIDialog } from 'deneb-ui';
import { VideoPlayerHelpDialog } from '../../help-dialog/help-dialog.component';

@Component({
    selector: 'video-player-help-button',
    template: '<i class="help circle icon"></i>',
    styles: [`
        :host {
            display: inline-block;
            box-sizing: border-box;
            flex: 0 0 auto;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
            padding: 0.4rem;
            cursor: pointer;
            line-height: 1;
        }
    `]
})
export class VideoPlayerHelpButton {
    constructor(private _dialogService: UIDialog) {
    }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._dialogService.open(VideoPlayerHelpDialog, {stickyDialog: false, backdrop: true});
    }
}
