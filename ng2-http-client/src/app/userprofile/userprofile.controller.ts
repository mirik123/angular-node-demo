import * as _ from 'lodash';
import { appService } from '../app.service';
import { Inject, Component, ViewContainerRef, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';

@Component({
    selector: 'userprofile',
    templateUrl: 'userprofile.html'
})
export class userprofileCtrl implements OnInit {
    title: string;
    httpError = null;
    maxDate: Date;
    profilemodel = {
        username: '',
        password: '',
        permissions: '',
        birthdate: null,
        email: ''
    };

    constructor(private $state: Router, private $appService: appService, private $mdDialog: MdDialog) {
        this.title = 'User Profile';
        this.maxDate = new Date();

        if (!this.$appService.authtoken) return;

        this.$appService.title.value = this.title;        
    }

    ngOnInit() {
        this.reload();
    }

    reload() {
        this.$appService.http('/api/profile', 'GET')
            .subscribe(dt => {
                var data = dt.json();
                this.profilemodel = {
                    username: this.$appService.username,
                    password: '',
                    permissions: data.permissions,
                    birthdate: moment.utc(data.birthdate).toDate(),
                    email: data.email
                };

                this.httpError = null;
                console.log('get profile', data);
            },
            err => {
                this.httpError = err;
                console.error('profile error', err);
            });
    }

    update() {
        var model = _.cloneDeep(this.profilemodel);
        model.birthdate = moment.utc(model.birthdate).format();
        this.profilemodel.password = '';

        this.$appService.http('/api/profile', 'POST', {}, model)
            .subscribe(dt => {
                var data = dt.json();
                this.httpError = null;
                console.log('updated profile', data);

                this.$mdDialog.open(
                    this.$mdDialog.alert()
                    .title('Info')
                    .textContent('Profile has been updated') 
                        .ok('OK')
                );
            },
            err => {
                this.httpError = err;                
                console.error('profile error', err);
            });
    }
}