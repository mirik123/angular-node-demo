import * as _ from 'lodash';

export interface IAppService {
    title: { value: string };
    username: string;
    authtoken: string;
    permissions: string;
    host: string;
    encodecreds(username, password);
    http(url: string, method: string, headers?: ng.IHttpRequestConfigHeaders, data?): ng.IHttpPromise<any>;
}

export class appService implements IAppService {
    private $http: ng.IHttpService;
    private $rootScope: ng.IRootScopeService;

    public title: any;
    public username: string = '';
    public authtoken: string = '';
    public permissions: string = '';
    public host: string = 'http://ec2-54-91-217-27.compute-1.amazonaws.com:8080'; //'https://ec2-54-91-217-27.compute-1.amazonaws.com:8443';

    static $inject = ['$http', '$rootScope'];
    constructor($http, $rootScope) {
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.title = { value: '' };
    }

    public encodecreds(username: string, password: string) {
        var base64creds = Buffer.from(username + ':' + password, 'utf8').toString('base64');
        return base64creds;
    }

    public http(url: string, method: string, headers?: ng.IHttpRequestConfigHeaders, data?): ng.IHttpPromise<any> {
        var defheaders = {};
        defheaders['Content-Type'] = 'application/json';

        if (this.authtoken) {
            defheaders['Authorization'] = 'Bearer ' + this.authtoken;  
        }

        return this.$http({
            url: this.host + url,
            method: method,
            data: data,
            headers: _.merge(defheaders, headers || {}),
            withCredentials: true
        });
    }
}
