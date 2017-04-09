import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Episode} from '../../../entity/episode';
import {AdminService} from '../../admin.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UIDialogRef, UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {BaseError} from '../../../../helpers/error/BaseError';
import {Subscription} from 'rxjs';

@Component({
    selector: 'episode-detail',
    templateUrl: './episode-detail.html',
    styleUrls: ['./episode-detail.less']
})
export class EpisodeDetail implements OnInit, OnDestroy {

    private _toastRef: UIToastRef<UIToastComponent>;
    private _subscription = new Subscription();

    episodeStatus = [
        {text: '未下载', labelColor: 'red'},
        {text: '下载中', labelColor: 'blue'},
        {text: '已下载', labelColor: 'teal'}
    ];

    @Input()
    episode: Episode;

    episodeForm: FormGroup;

    isSaving: boolean = false;

    constructor(private _adminService: AdminService,
                private _dialogRef: UIDialogRef<EpisodeDetail>,
                toastService: UIToast,
                fb: FormBuilder) {
        this._toastRef = toastService.makeText();
        this.episodeForm = fb.group({
            episode_no: 0,
            name: '',
            name_cn: '',
            bgm_eps_id: 0,
            airdate: '',
            duration: ''
        });
    }

    ngOnInit(): void {
        if (this.episode) {
            this.episodeForm.patchValue(this.episode);
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    cancel(): void {
        this._dialogRef.close(false);
    }

    saveEpisode(): void {
        this.isSaving = true;
        let modelValue = this.episodeForm.value;
        let episode = Object.assign({}, this.episode);
        episode.episode_no = modelValue.episode_no as number;
        episode.bgm_eps_id = modelValue.bgm_eps_id as number;
        episode.name = modelValue.name as string;
        episode.name_cn = modelValue.name_cn as string;
        episode.airdate = modelValue.airdate as string;
        episode.duration = modelValue.duration as string;
        let saveObservable;
        if (episode.id) {
            saveObservable = this._adminService.updateEpisode(episode);
        } else {
            saveObservable = this._adminService.addEpisode(episode);
        }
        this._subscription.add(saveObservable
            .subscribe(
                () => {
                    this.isSaving = false;
                    this._toastRef.show(episode.id ? '添加成功' : '更新成功');
                    this._dialogRef.close(true);
                },
                (error: BaseError) => {
                    this.isSaving = false;
                    this._toastRef.show(error.message);
                }
            )
        );
    }

    // onFileSelect(files: File[]) {
    //     if (files.length > 0) {
    //         let formData: FormData = new FormData();
    //         let xhr: XMLHttpRequest = new XMLHttpRequest();
    //         let intervalId;
    //         formData.append('file', files[0], files[0].name);
    //         xhr.onreadystatechange = () => {
    //             if (xhr.readyState === 4) {
    //                 if (xhr.status === 200) {
    //                     console.log('upload success');
    //                 } else {
    //                     console.log(xhr.response);
    //                 }
    //                 clearInterval(intervalId);
    //             }
    //         };
    //
    //         intervalId = setInterval(() => {
    //         }, 500);
    //
    //         xhr.upload.onprogress = (event) => {
    //             this.uploadProgress = Math.round(event.loaded / event.total * 100);
    //         };
    //
    //         xhr.open('POST', `/api/admin/episode/${this.episode.id}/upload`, true);
    //         xhr.send(formData);
    //     }
    // }
}
