import * as _ from 'lodash';
import { Inject, Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class appService {

    public title: any;
    public username: string = '';
    public authtoken: string = '';
    public permissions: string = '';
    public host: string = 'http://localhost:8080'; //'https://localhost:8443';

    constructor(private $http: Http) {
        this.title = { value: '' };
    }

    public encodecreds(username: string, password: string) {
        var base64creds = Buffer.from(username + ':' + password, 'utf8').toString('base64');
        return base64creds;
    }

    public http(url: string, method: string, headers?: any, data?): Observable<Response> {
        var defheaders = {};
        defheaders['Content-Type'] = 'application/json';

        if (this.authtoken) {
            defheaders['Authorization'] = 'Bearer ' + this.authtoken;  
        }

        return this.$http.request(this.host + url, {
            method: method,
            body: data,
            headers: _.merge(defheaders, headers || {}),
            withCredentials: true
        });
    }
}
