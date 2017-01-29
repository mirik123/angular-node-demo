import * as _ from 'lodash';
import { IAppService } from '../app.service';

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

    static $inject = ['$state', 'appService', '$cookies', '$scope'];
    constructor($state: ng.ui.IStateService, appService: IAppService, $cookies: ng.cookies.ICookiesService, $scope: ng.IScope) {
        this.$state = $state;
        this.appService = appService;
        this.$cookies = $cookies;
        
        this.title = 'LOGIN';
        this.appService.title.value = '';

        /*var cookie = $cookies.getObject('angular-demo-authtoken');
        if (cookie && cookie.authtoken) {
            this.appService.permissions = cookie.permissions;
            this.appService.username = cookie.username;

            this.$state.go('sidenav');
        }*/

        if (this.appService.isConnected) {
            this.$state.go('sidenav');
            return;
        }

        var clearEvt = this.appService.$rootScope.$on('login', (evt, data) => {
            if (!data) {
                this.httpError = 'incorrect request';
                return;
            }

            if (!data.error) {
                this.appService.permissions = data.permissions;
                this.appService.username = data.username;
                /*this.$cookies.putObject('angular-demo-authtoken', {
                    permissions: this.appService.permissions,
                    username: this.appService.username
                });*/

                this.$state.go('sidenav');
            }
            else {
                this.httpError = data.error;
                this.appService.permissions = '';
                this.appService.username = '';
                //this.$cookies.remove('angular-demo-authtoken');

                console.error('login error', data);

            }
        });

        $scope.$on("$destroy", () => clearEvt());
    }

    login() {
        this.appService.send('login', this.loginmodel);
    }
}