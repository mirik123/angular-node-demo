
export class loginCtrl {
    title: string;
    testdt: Date;
    $state: ng.ui.IStateService;
    appService: IAppService;
    httpError = {};
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
                this.appService.password = this.loginmodel.password;
                this.$state.go('sidenav');
            },
            (dt) => {
                this.httpError = dt.data;
                this.appService.permissions = '';
                this.appService.authtoken = '';
                this.appService.username = '';
                this.appService.password = '';
                console.error('login error', dt.data);
            });
    }
}