import { Component, Input, OnInit } from '@angular/core';
import { UIDialogRef } from 'deneb-ui';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'feedback-dialog',
    templateUrl: './feedback.html',
    styleUrls: ['./feedback.less']
})
export class FeedbackComponent implements OnInit {

    feedbackForm: FormGroup;

    issueList = ['有画面无声音', '有声音无画面', '无声音无画面', '其他'];

    pickedIndex = -1;

    constructor(private _dialogRef: UIDialogRef<FeedbackComponent>,
                private _fb: FormBuilder) {
    }

    pickIssue(index: number) {
        this.pickedIndex = index;
    }

    submit() {
        if (this.pickedIndex === -1) {
            return;
        }
        let desc = this.feedbackForm.value.desc;
        if (!desc) {
            desc = '无';
        }
        this._dialogRef.close(`问题：${this.issueList[this.pickedIndex]}, 附加描述： ${desc}`);
    }

    cancel() {
        this._dialogRef.close(null);
    }

    ngOnInit(): void {
        this.feedbackForm = this._fb.group({
            desc: ['']
        });
    }
}
