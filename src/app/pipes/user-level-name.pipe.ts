import {Pipe, PipeTransform} from '@angular/core';

export const LEVEL_NAMES = ['默认等级Level 0', '用户Level 1', '管理员Level 2', '超级管理员Level 3'];

@Pipe({name: 'userLevelName'})
export class UserLevelNamePipe implements PipeTransform {

    transform(level: number): any {
        return LEVEL_NAMES[level] || '未知';
    }
}
