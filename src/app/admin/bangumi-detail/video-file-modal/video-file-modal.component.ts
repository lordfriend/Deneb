import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UIDialogRef, UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {Subscription} from 'rxjs';
import {VideoFile} from '../../../entity/video-file';
import {Episode} from '../../../entity/episode';
import {AdminService} from '../../admin.service';
import {BaseError} from '../../../../helpers/error/BaseError';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    selector: 'video-file-modal',
    templateUrl: './video-file-modal.html',
    styleUrls: ['./video-file-list.less']
})
export class VideoFileModal implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    @Input()
    episode: Episode;

    videoFileList: FormGroup[];

    constructor(private _dialogRef: UIDialogRef<VideoFileModal>,
                private _adminService: AdminService,
                private _fb: FormBuilder,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    saveVideoFile(videoFileGroup: FormGroup) {
        let videoFile = videoFileGroup.value as VideoFile;
        if (videoFile.id) {
            this._subscription.add(
                this._adminService.updateVideoFile(videoFile)
                    .subscribe(
                        () => {
                            this._toastRef.show('保存成功');
                            videoFileGroup.markAsPristine();
                        },
                        (error: BaseError) => {
                            this._toastRef.show('保存失败, ' + error.message);
                        }
                    )
            );
        } else {
            this._subscription.add(
                this._adminService.addVideoFile(videoFile)
                    .subscribe(
                        (id) => {
                            videoFileGroup.patchValue({id: id});
                            this._toastRef.show('保存成功');
                            videoFileGroup.markAsPristine();
                        },
                        (error: BaseError) => {
                            this._toastRef.show('保存失败, ' + error.message);
                        }
                    )
            )
        }
    }

    deleteVideoFile(videoFileGroup: FormGroup) {
        let videoFile = videoFileGroup.value as VideoFile;
        if (!videoFile.id) {
            this.videoFileList.splice(this.videoFileList.indexOf(videoFileGroup), 1);
            return;
        }
        this._subscription.add(
            this._adminService.deleteVideoFile(videoFile.id)
                .subscribe(
                    () => {
                        this._toastRef.show('删除成功');
                        this.videoFileList.splice(this.videoFileList.indexOf(videoFileGroup), 1);
                    },
                    (error: BaseError) => {
                        this._toastRef.show('删除失败, ' + error.message);
                    }
                )
        );
    }

    addVideoFile() {
        let videoFileFormGroup = this._fb.group({
            id: null,
            bangumi_id: this.episode.bangumi_id,
            episode_id: this.episode.id,
            download_url: '',
            torrent_id: null,
            status: VideoFile.STATUS_DOWNLOAD_PENDING,
            file_path: null,
            file_name: null,
            resolution_w: null,
            resolution_h: null,
            duration: null,
            label: null
        });
        this.videoFileList.unshift(videoFileFormGroup);
    }

    close() {
        this._dialogRef.close(null);
    }

    ngOnInit(): void {
        this._subscription.add(
            this._adminService.getEpisodeVideoFiles(this.episode.id)
                .subscribe(
                    (videoFileList) => {
                        this.videoFileList = videoFileList.map((videoFile) => {
                            return this._fb.group({
                                id: videoFile.id,
                                bangumi_id: videoFile.bangumi_id,
                                episode_id: videoFile.episode_id,
                                download_url: videoFile.download_url,
                                torrent_id: videoFile.torrent_id,
                                status: videoFile.status,
                                file_path: videoFile.file_path,
                                file_name: videoFile.file_name,
                                resolution_w: videoFile.resolution_w,
                                resolution_h: videoFile.resolution_h,
                                duration: videoFile.duration,
                                label: videoFile.label
                            });
                        });
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                        this.close();
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
