import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class sidenavCtrl {
    get title() {
        return this.appService.title.value ? this.appService.username + ' - ' + this.appService.title.value : '';
    };
    appService: IAppService;
    $state: ng.ui.IStateService;
    $stateParams: ng.ui.IStateParamsService;
    $cookies: ng.cookies.ICookiesService;

    static $inject = ['$scope', '$state', '$stateParams', 'appService', '$cookies'];
    constructor($scope, $state: ng.ui.IStateService, $stateParams: ng.ui.IStateParamsService, appService: IAppService, $cookies: ng.cookies.ICookiesService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.appService = appService;
        this.$cookies = $cookies; 
    }

    selectTab(target: string) {
        this.$state.go((target !=='login' ? 'sidenav.':'')+target, {}, { reload: true });
    }
     
    logout() {
        this.appService.http('/api/logout', 'POST');
        this.appService.permissions = '';
        this.appService.authtoken = '';
        this.appService.username = '';
        this.appService.title.value = '';
        this.$cookies.remove('angular-demo-authtoken');
         
        this.selectTab('login');
    }
}