import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class sidenavCtrl {
    get title() {
        return this.appService.title.value ? this.appService.username + ' - ' + this.appService.title.value : '';
    };
    appService: IAppService;
    $state: ng.ui.IStateService;
    $stateParams: ng.ui.IStateParamsService;

    static $inject = ['$scope', '$state', '$stateParams', 'appService'];
    constructor($scope, $state: ng.ui.IStateService, $stateParams: ng.ui.IStateParamsService, appService: IAppService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.appService = appService;

        var clearEvt = this.appService.$rootScope.$on('logout', (evt, data) => {
            this.appService.permissions = '';
            this.appService.username = '';
            this.appService.title.value = '';  
            this.appService.disconnect();

            this.selectTab('login');  
        });

        $scope.$on("$destroy", () => clearEvt());
    }

    selectTab(target: string) {
        this.$state.go((target !=='login' ? 'sidenav.':'')+target, {}, { reload: true });
    }
     
    logout() {
        this.appService.send('logout', {});   
    }
}