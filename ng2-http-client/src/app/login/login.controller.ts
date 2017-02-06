import * as _ from 'lodash';
import { appService } from '../app.service';
import { Inject, Component, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';

@Component({
    selector: 'login-ctrl',
    templateUrl: 'login.html' 
})
export class loginCtrl implements OnInit {
    title: string;
    httpError = null;
    loginmodel = {
        username: '',
        password: ''
    };

    constructor(private $state: Router, private appService: appService) {
        this.title = 'LOGIN';
        this.appService.title.value = '';
    }

    ngOnInit() {
        var cookie = JSON.parse(Cookie.get('angular-demo-authtoken') || '{}');

        if (cookie && cookie.authtoken) {
            this.appService.authtoken = cookie.authtoken;

            this.appService.http('/api/dummy', 'POST')
                .subscribe(dt => {
                    if (dt.status === 401) {
                        this.appService.http('/api/logout', 'POST');
                        this.appService.permissions = '';
                        this.appService.authtoken = '';
                        this.appService.username = '';

                        Cookie.delete('angular-demo-authtoken');
                    }
                    else {
                        this.appService.permissions = cookie.permissions;
                        this.appService.username = cookie.username;

                        this.$state.navigateByUrl('/sidenav');
                    }
                });
        }
    }

    login() {
        var base64creds = this.appService.encodecreds(this.loginmodel.username, this.loginmodel.password);
        this.appService.http('/api/login', 'POST', new Headers({ 'Authorization': 'Basic ' + base64creds }))
            .subscribe(dt => {
                var data = dt.json();
                if (!data) {
                    this.httpError = 'incorrect request';
                    return;
                }

                this.appService.permissions = data.permissions;
                this.appService.authtoken = data.authtoken;
                this.appService.username = this.loginmodel.username;
                Cookie.set('angular-demo-authtoken', JSON.stringify({
                    permissions: this.appService.permissions,
                    authtoken: this.appService.authtoken,
                    username: this.appService.username
                }));

                this.$state.navigate(['sidenav']);
            },
            dt => {
                this.httpError = dt;
                this.appService.permissions = '';
                this.appService.authtoken = '';
                this.appService.username = '';
                Cookie.delete('angular-demo-authtoken');

                console.error('login error', dt);
            });
    }
}