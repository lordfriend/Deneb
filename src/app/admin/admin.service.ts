import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../helpers/base.service';
import { queryString } from '../../helpers/url'
import { Bangumi, BangumiRaw } from '../entity';
import { Episode } from '../entity';
import { VideoFile } from '../entity/video-file';


@Injectable()
export class AdminService extends BaseService {

    private baseUrl = '/api/admin';

    constructor(private http: HttpClient) {
        super();
    }

    queryBangumi(bgmId: number): Observable<BangumiRaw> {
        let queryUrl = this.baseUrl + '/query/' + bgmId;
        return this.http.get<any>(queryUrl).pipe(
            map<any, BangumiRaw>(res => new BangumiRaw(res)),
            catchError(this.handleError));
    }

    searchBangumi(params: {name: string, type: number, offset: number, count: number}): Observable<{data: Bangumi[], total: number}> {
        let queryParams = queryString(params);
        return this.http.get<{data: Bangumi[], total: number}>(`${this.baseUrl}/query?${queryParams}`).pipe(
            catchError(this.handleError),);
    }

    addBangumi(bangumiRaw: BangumiRaw): Observable<string> {
        let queryUrl = this.baseUrl + '/bangumi';
        return this.http.post<{data:{id: string}}>(queryUrl, bangumiRaw).pipe(
            map(res => res.data.id),
            catchError(this.handleError),);
    }

    listBangumi(params: {
        page: number,
        count: number,
        order_by: string,
        sort: string,
        name?: string,
        type?: number}): Observable<{ data: Bangumi[], total: number }> {
        let queryParams = queryString(params);
        return this.http.get<{ data: Bangumi[], total: number }>(`${this.baseUrl}/bangumi?${queryParams}`).pipe(
            catchError(this.handleError),);
    }

    getBangumi(id: string): Observable<Bangumi> {
        let queryUrl = this.baseUrl + '/bangumi/' + id;
        return this.http.get<{ data: Bangumi }>(queryUrl).pipe(
            map(res => res.data),
            catchError(this.handleError),)
    }

    updateBangumi(bangumi: Bangumi): Observable<any> {
        let id = bangumi.id;
        let queryUrl = this.baseUrl + '/bangumi/' + id;
        return this.http.put<any>(queryUrl, bangumi).pipe(
            catchError(this.handleError),);
    }

    deleteBangumi(bangumi_id: string): Observable<{delete_delay: number}> {
        return this.http.delete<{ data: {delete_delay: number} }>(`${this.baseUrl}/bangumi/${bangumi_id}`).pipe(
            map(res => res.data),
            catchError(this.handleError),)
    }

    getEpisode(episode_id: string): Observable<Episode> {
        return this.http.get<{ data: Episode }>(`${this.baseUrl}/episode/${episode_id}`).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }

    addEpisode(episode: Episode): Observable<string> {
        return this.http.post<{ data: {id: string} }>(`${this.baseUrl}/episode`, episode).pipe(
            map(res => <string> res.data.id),
            catchError(this.handleError),);
    }

    updateEpisode(episode: Episode): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/episode/${episode.id}`, episode).pipe(
            catchError(this.handleError),);
    }

    deleteEpisode(episode_id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/episode/${episode_id}`).pipe(
            catchError(this.handleError),)
    }

    getEpisodeVideoFiles(episode_id: string): Observable<VideoFile[]> {
        return this.http.get<{data: VideoFile[]}>(`${this.baseUrl}/video-file?episode_id=${episode_id}`).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }

    deleteVideoFile(video_file_id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/video-file/${video_file_id}`).pipe(
            catchError(this.handleError),);
    }

    addVideoFile(videoFile: VideoFile): Observable<string> {
        return this.http.post<{data: string}>(`${this.baseUrl}/video-file`, videoFile).pipe(
            map(res => res.data),
            catchError(this.handleError),);
    }

    updateVideoFile(videoFile: VideoFile): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/video-file/${videoFile.id}`, videoFile).pipe(
            catchError(this.handleError),);
    }
}
