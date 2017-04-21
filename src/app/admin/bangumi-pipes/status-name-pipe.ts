import {Pipe, PipeTransform} from '@angular/core';

export const BANGUMI_STATUS = {
    0: 'Pending',
    1: 'On Air',
    2: 'Finished'
};

@Pipe({name: 'bangumiStatusName'})
export class BangumiStatusNamePipe implements PipeTransform {
    transform(value: number): any {
        return BANGUMI_STATUS[value];
    }
}

export const VIDEO_FILE_STATUS = {
    1: '未下载',
    2: '下载中',
    3: '已下载'
};

@Pipe({name: 'videoFileStatusName'})
export class VideoFileStatusNamePipe implements PipeTransform {

    transform(value: number): any {
        return VIDEO_FILE_STATUS[value];
    }
}
