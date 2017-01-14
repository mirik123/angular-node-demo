
export class loginCtrl {
    title: string;
    $state: ng.ui.IStateService;
    $cookies: ng.cookies.ICookiesService;
    appService: IAppService;
    httpError = null;
    loginmodel = {
        username: '',
        password: ''
    };

    static $inject = ['$state', 'appService', '$cookies'];
    constructor($state: ng.ui.IStateService, appService: IAppService, $cookies: ng.cookies.ICookiesService) {
        this.$state = $state;
        this.appService = appService;
        this.$cookies = $cookies;
        
        this.title = 'LOGIN';

        var authtoken = $cookies.getObject('angular-demo-authtoken');
        if (authtoken) {
            this.appService.permissions = authtoken.permissions;
            this.appService.authtoken = authtoken.authtoken;
            this.appService.username = authtoken.username;
            this.$state.go('sidenav');
        }
    }

    login() {
        var base64creds = this.appService.encodecreds(this.loginmodel.username, this.loginmodel.password);
        this.appService.http('/api/login', 'POST', { 'Authorization': 'Basic ' + base64creds })
            .then((dt) => {
                this.appService.permissions = dt.data.permissions;
                this.appService.authtoken = dt.data.authtoken;
                this.appService.username = this.loginmodel.username;
                this.$cookies.putObject('angular-demo-authtoken', {
                    permissions: this.appService.permissions,
                    authtoken: this.appService.authtoken,
                    username: this.appService.username
                });

                this.$state.go('sidenav');
            },
            (dt) => {
                this.httpError = dt.data;
                this.appService.permissions = '';
                this.appService.authtoken = '';
                this.appService.username = '';
                this.$cookies.remove('angular-demo-authtoken');

                console.error('login error', dt.data);
            });
    }
}