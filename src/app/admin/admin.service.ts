import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../helpers/base.service';
import { queryString } from '../../helpers/url'
import { Bangumi, BangumiRaw } from '../entity';
import { Episode } from '../entity/episode';
import { VideoFile } from '../entity/video-file';


@Injectable()
export class AdminService extends BaseService {

    private baseUrl = '/api/admin';

    constructor(private http: Http) {
        super();
    }

    queryBangumi(bgmId: number): Observable<BangumiRaw> {
        let queryUrl = this.baseUrl + '/query/' + bgmId;
        return this.http.get(queryUrl).pipe(
            map(res => new BangumiRaw(res.json())),
            catchError(this.handleError),);
    }

    searchBangumi(params: {name: string, type: number, offset: number, count: number}): Observable<{data: Bangumi[], total: number}> {
        let queryParams = queryString(params);
        return this.http.get(`${this.baseUrl}/query?${queryParams}`).pipe(
            map(res => <Bangumi[]> res.json()),
            catchError(this.handleError),);
    }

    addBangumi(bangumiRaw: BangumiRaw): Observable<string> {
        let queryUrl = this.baseUrl + '/bangumi';
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(bangumiRaw);
        return this.http.post(queryUrl, body, options).pipe(
            map(res => res.json().data.id),
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
        return this.http.get(`${this.baseUrl}/bangumi?${queryParams}`).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    getBangumi(id: string): Observable<Bangumi> {
        let queryUrl = this.baseUrl + '/bangumi/' + id;
        return this.http.get(queryUrl).pipe(
            map(res => res.json().data),
            catchError(this.handleError),)
    }

    updateBangumi(bangumi: Bangumi): Observable<any> {
        let id = bangumi.id;
        let queryUrl = this.baseUrl + '/bangumi/' + id;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(bangumi);
        return this.http.put(queryUrl, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    deleteBangumi(bangumi_id: string): Observable<{delete_delay: number}> {
        return this.http.delete(`${this.baseUrl}/bangumi/${bangumi_id}`).pipe(
            map(res => res.json().data as {delete_delay: number}),
            catchError(this.handleError),)
    }

    getEpisode(episode_id: string): Observable<Episode> {
        return this.http.get(`${this.baseUrl}/episode/${episode_id}`).pipe(
            map(res => <Episode> res.json().data),
            catchError(this.handleError),);
    }

    addEpisode(episode: Episode): Observable<string> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(episode);
        return this.http.post(`${this.baseUrl}/episode`, body, options).pipe(
            map(res => <string> res.json().data.id),
            catchError(this.handleError),);
    }

    updateEpisode(episode: Episode): Observable<any> {
        let id = episode.id;
        let queryUrl = this.baseUrl + '/episode/' + id;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(episode);
        return this.http.put(queryUrl, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    deleteEpisode(episode_id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/episode/${episode_id}`).pipe(
            map(res => res.json()),
            catchError(this.handleError),)
    }

    updateThumbnail(episode: Episode, time: string): Observable<any> {
        let id = episode.id;
        let queryUrl = this.baseUrl + '/episode/' + id + '/thumbnail';
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify({time: time});
        return this.http.put(queryUrl, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    getEpisodeVideoFiles(episode_id: string): Observable<VideoFile[]> {
        return this.http.get(`${this.baseUrl}/video-file?episode_id=${episode_id}`).pipe(
            map(res => res.json().data as VideoFile[]),
            catchError(this.handleError),);
    }

    deleteVideoFile(video_file_id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/video-file/${video_file_id}`).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }

    addVideoFile(videoFile: VideoFile): Observable<string> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(videoFile);
        return this.http.post(`${this.baseUrl}/video-file`, body, options).pipe(
            map(res => res.json().data as string),
            catchError(this.handleError),);
    }

    updateVideoFile(videoFile: VideoFile): Observable<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = JSON.stringify(videoFile);
        return this.http.put(`${this.baseUrl}/video-file/${videoFile.id}`, body, options).pipe(
            map(res => res.json()),
            catchError(this.handleError),);
    }
}
