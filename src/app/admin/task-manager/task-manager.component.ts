import {Component, OnInit} from '@angular/core';
import {Bangumi} from '../../entity/bangumi';
import {TaskService} from './task.service';
import {Subscription} from 'rxjs/Subscription';
import {UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {BaseError} from '../../../helpers/error/BaseError';
import {Episode} from '../../entity/episode';

@Component({
    selector: 'task-manager',
    templateUrl: './task-manager.html',
    styleUrls: ['./task-manager.less']
})
export class TaskManager implements OnInit {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    pendingDeleteBangumi: Bangumi[];
    bangumiDeleteDelay: number;

    pendingDeleteEpisode: Episode[];
    episodeDeleteDelay: number


    constructor(private _taskService: TaskService,
                toastService: UIToast,) {
        this._toastRef = toastService.makeText();
    }

    ngOnInit(): void {
        this.refreshBangumiList();
        this.refreshEpisodeList();
    }

    refreshBangumiList() {
        this._subscription.add(
            this._taskService.listPendingDeleteBangumi()
                .subscribe(
                    (result) => {
                        this.pendingDeleteBangumi = result.data;
                        this.bangumiDeleteDelay = result.delete_delay;
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    refreshEpisodeList() {
        this._subscription.add(
            this._taskService.listPendingDeleteEpisode()
                .subscribe(
                    (result) => {
                        this.pendingDeleteEpisode = result.data;
                        this.episodeDeleteDelay = result.delete_delay;
                    }
                )
        )
    }

    restoreBangumi(bangumi_id: string) {
        this._subscription.add(
            this._taskService.restoreBangumi(bangumi_id)
                .subscribe(
                    () => {
                        this.refreshBangumiList();
                        this._toastRef.show('恢复成功');
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }

    restoreEpisode(episode_id: string) {
        this._subscription.add(
            this._taskService.restoreEpisode(episode_id)
                .subscribe(
                    () => {
                        this.refreshEpisodeList();
                        this._toastRef.show('恢复成功');
                    },
                    (error: BaseError) => {
                        this._toastRef.show(error.message);
                    }
                )
        );
    }
}
