
export class mainCtrl {
    title: string;

    static $inject = ['$scope', '$state', 'appService'];
    constructor($scope, $state: ng.ui.IStateService, appService: IAppService) {
        this.title = 'MAIN';
    }
}
