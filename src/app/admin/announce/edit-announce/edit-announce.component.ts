import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UIDialogRef } from 'deneb-ui';
import { Announce } from '../../../entity/announce';

@Component({
    selector: 'admin-edit-announce',
    templateUrl: './edit-announce.html',
    styleUrls: ['./edit-announce.less']
})
export class EditAnnounceComponent implements OnInit {

    @Input()
    announce: Announce;

    announceForm: FormGroup;

    position = 1;

    constructor(private _dialogRef: UIDialogRef<EditAnnounceComponent>,
                private _fb: FormBuilder) {
    }

    onPositionChange(position: number) {
        this.position = position;
    }

    cancel() {
        this._dialogRef.close();
    }

    save() {
        let result = this.announceForm.value;
        result.position = this.position;
        this._dialogRef.close(result);
    }

    ngOnInit(): void {
        if (this.announce) {
            this.announceForm = this._fb.group({
                sort_order: [this.announce.sort_order, Validators.required],
                url: [this.announce.url, Validators.required],
                image_url: [this.announce.image_url, Validators.required],
                start_time: [this.announce.start_time, Validators.required],
                end_time: [this.announce.end_time, Validators.required]
            });
            this.position = this.announce.position;
        } else {
            this.announceForm = this._fb.group({
                sort_order: [0, Validators.required],
                url: ['', Validators.required],
                image_url: ['', Validators.required],
                start_time: [Date.now().valueOf(), Validators.required],
                end_time: [Date.now().valueOf(), Validators.required]
            })
        }

    }
}
