import {Component, Input, Output, EventEmitter} from '@angular/core';


@Component({
    selector: 'volume-control',
    templateUrl: './volume-control.html',
    styleUrls: ['./volume-control.less']
})
export class VolumeControl {

    /**
     * indicates the volume on slider
     */
    private _volumeLevel: number = 100;

    @Input() set volume(vol: number) {
        this._volumeLevel = vol;
    }

    @Input() set muted(muted: boolean) {
        if (muted) {
            this._volumeLevel = 0;
        }
    }

    @Output() volumeChanges = new EventEmitter<number>();

    get volumeLevel(): number {
        return this._volumeLevel;
    }

    volumeChange(level: number) {
        this._volumeLevel = level;
        this.volumeChanges.emit(this._volumeLevel);
    }

}
