
export class sidenavCtrl {
    title: any;
    appService: IAppService;
    $state: ng.ui.IStateService;
    $stateParams: ng.ui.IStateParamsService;

    static $inject = ['$scope', '$state', '$stateParams', 'appService'];
    constructor($scope, $state: ng.ui.IStateService, $stateParams: ng.ui.IStateParamsService, appService: IAppService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.appService = appService;
        this.title = appService.title;
    }

    selectTab(target: string) {
        this.$state.go((target !=='login' ? 'sidenav.':'')+target, {}, { reload: true });
    }

    logout() {
        this.appService.http('/api/logout', 'POST');
        this.appService.permissions = '';
        this.appService.authtoken = '';
        this.appService.username = '';
        this.appService.password = '';

        this.selectTab('login');
    }
}