
export class loginCtrl {
    title: string;
    $state: ng.ui.IStateService;
    appService: IAppService;
    httpError = null;
    loginmodel = {
        username: '',
        password: ''
    };

    static $inject = ['$state', 'appService'];
    constructor($state: ng.ui.IStateService, appService: IAppService) {
        this.$state = $state;
        this.appService = appService;
        
        this.title = 'LOGIN';
    }

    login() {
        var base64creds = this.appService.encodecreds(this.loginmodel.username, this.loginmodel.password);
        this.appService.http('/api/login', 'POST', { 'Authorization': 'Basic ' + base64creds })
            .then((dt) => {
                this.appService.permissions = dt.data.permissions;
                this.appService.authtoken = dt.data.authtoken;
                this.appService.username = this.loginmodel.username;
                this.$state.go('sidenav');
            },
            (dt) => {
                this.httpError = dt.data;
                this.appService.permissions = '';
                this.appService.authtoken = '';
                this.appService.username = '';
                console.error('login error', dt.data);
            });
    }
}