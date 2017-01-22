
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
        this.appService.title.value = '';

        var cookie = $cookies.getObject('angular-demo-authtoken');
        if (cookie && cookie.authtoken) {
            this.appService.authtoken = cookie.authtoken;

            this.appService.http('/api/dummy', 'POST')
                .catch(dt => {
                    if (dt.status === 401) {
                        this.appService.http('/api/logout', 'POST');
                        this.appService.permissions = '';
                        this.appService.authtoken = '';
                        this.appService.username = '';
                        
                        $cookies.remove('angular-demo-authtoken');
                    }
                    else {
                        this.appService.permissions = cookie.permissions;
                        this.appService.username = cookie.username;

                        this.$state.go('sidenav');
                    }
                });
        }
    }

    login() {
        var base64creds = this.appService.encodecreds(this.loginmodel.username, this.loginmodel.password);
        this.appService.http('/api/login', 'POST', { 'Authorization': 'Basic ' + base64creds })
            .then(dt => {
                if (!dt.data) {
                    this.httpError = 'incorrect request';
                    return;
                }

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
            dt => {
                this.httpError = dt.data;
                this.appService.permissions = '';
                this.appService.authtoken = '';
                this.appService.username = '';
                this.$cookies.remove('angular-demo-authtoken');

                console.error('login error', dt.data);
            });
    }
}