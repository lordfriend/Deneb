import {Component, Input} from '@angular/core';
import {Episode} from "../../../entity/episode";
import {AdminService} from '../../admin.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'episode-thumbnail',
    templateUrl: './episode-thumbnail.html',
})
export class EpisodeThumbnail {

    @Input()
    episode: Episode;

    timeForm: FormGroup;

    get duration(): number {
        if (!this.episode.duration) {
            return 0;
        }
        let timePart = this.episode.duration.split(':');
        let seconds = parseInt(timePart[timePart.length - 1], 10);
        let minutes = parseInt(timePart[timePart.length - 2], 10) * 60;
        let hours = 0;
        if (timePart.length > 2) {
            hours = parseInt(timePart[timePart.length - 3], 10) * 3600;
        }
        return seconds + minutes + hours;
    }

    isSaving: boolean = false;

    time: string = '';

    constructor(private _adminService: AdminService,
                fb: FormBuilder) {
        this.timeForm = fb.group({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        });
    }

    private getBaseUrl(url) {
        return url.split('?')[0];
    }

    /**
     * to HH:mm:ss.SSS
     * @param timeInSeconds
     */
    private toTimestampString(timeInSeconds: number): string {
        let hours = Math.floor(timeInSeconds / 3600);
        let minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
        let seconds = Math.floor(timeInSeconds - hours * 3600 - minutes * 60);
        let milliseconds = Math.floor((timeInSeconds - Math.floor(timeInSeconds)) * 1000);
        return this.padLeft(hours, 1) + ':' + this.padLeft(minutes, 1) + ':' + this.padLeft(seconds, 1) + '.' + this.padLeft(milliseconds, 2);
    }

    private padLeft(value, length) {
        let s = '';
        for (var i = length; i >= 1; i--) {
            if (value < Math.pow(10, i)) {
                s = '0' + s;
            }
        }
        return s + value;
    }

    updateThumbnail(progress) {
        if (typeof progress !== 'undefined') {
            this.time = this.toTimestampString(this.duration * progress);
            console.log(this.time);
        }
        this.isSaving = true;
        this._adminService.updateThumbnail(this.episode, this.time)
            .subscribe(
                () => {
                    this.episode.thumbnail = this.getBaseUrl(this.episode.thumbnail) + '?time=' + this.time;
                    this.isSaving = false;
                },
                () => {
                    this.isSaving = false;
                }
            )
    }

}
