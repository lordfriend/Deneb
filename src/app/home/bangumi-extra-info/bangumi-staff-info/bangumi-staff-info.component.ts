import { Component, Input, OnInit } from '@angular/core';
import { Staff } from '../interfaces';

@Component({
    selector: 'bangumi-staff-info',
    templateUrl: './bangumi-staff-info.html',
    styleUrls: ['./bangumi-staff-info.less']
})
export class BangumiStaffInfoComponent implements OnInit {
    @Input()
    staffList: Staff[];

    staffMap: {[job: string]: Staff[]};

    jobs: string[];

    constructor() {
        this.staffMap = {};
        this.jobs = [];
    }

    ngOnInit(): void {
        this.staffList.forEach(staff => {
            staff.jobs.forEach(job => {
                if (!this.staffMap[job]) {
                    this.jobs.push(job);
                    this.staffMap[job] = [];
                }
                this.staffMap[job].push(staff);
            });
        });
    }
}
