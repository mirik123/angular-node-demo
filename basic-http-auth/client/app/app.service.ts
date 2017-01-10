

export class appService implements IAppService {
    private $http: ng.IHttpService;
    private $rootScope: ng.IRootScopeService;

    public title: any;
    public username: string = '';
    public password: string = '';
    public authtoken: string = '';
    public permissions: string = '';
    public host: string = 'http://localhost:3000';

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
