import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class loginCtrl {
    title: string;
    $state: ng.ui.IStateService;
    appService: IAppService;
    httpError = null;
    loginmodel = {
        username: '',
        password: ''
    };

    static $inject = ['$state', 'appService', '$scope'];
    constructor($state: ng.ui.IStateService, appService: IAppService, $scope: ng.IScope) {  
        this.$state = $state;
        this.appService = appService;
        
        this.title = 'LOGIN';
        this.appService.title.value = '';
        this.appService.permissions = '';
        this.appService.username = '';

        var clearEvt = this.appService.$rootScope.$on('login', (evt, data) => {
            if (data && !data.error) {
                this.appService.permissions = data.content.permissions;
                this.appService.username = data.content.username;

                this.$state.go('sidenav');
            }
            else {
                this.httpError = data.error;
                this.appService.permissions = '';
                this.appService.username = '';

                console.error('login error', data);

            }
        });

        $scope.$on("$destroy", () => clearEvt());
    }

    login() {
        this.appService.send('login', this.loginmodel);
    }
}