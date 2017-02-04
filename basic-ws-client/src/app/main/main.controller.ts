import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class mainCtrl {
    title: string;
    appService: IAppService;
    $mdDialog: ng.material.IDialogService;
    $state: ng.ui.IStateService;

    static $inject = ['$scope', '$state', 'appService', '$mdDialog'];
    constructor($scope, $state: ng.ui.IStateService, appService: IAppService, $mdDialog: ng.material.IDialogService) {
        this.$mdDialog = $mdDialog;
        this.appService = appService;
        this.$state = $state;

        this.title = 'MAIN';

        var clearEvt1 = appService.$rootScope.$on('websocket@open', (evt, data) => appService.send('login', {}));
        var clearEvt2 = appService.$rootScope.$on('websocket@close', this.OnWSClose.bind(this));
        //var clearEvt3 = appService.$rootScope.$on('websocket@error', this.OnWSClose.bind(this));
        var clearEvt4 = appService.$rootScope.$on('login', (evt, data) => {
            if (this.$state.current.name === 'login') return;

            if (data && !data.error) {
                this.appService.permissions = data.content.permissions;
                this.appService.username = data.content.username;
            }
            else {
                this.$state.go('login');
            }
        });

        this.appService.connect();

        $scope.$on("$destroy", () => {
            clearEvt1();
            clearEvt2();
            //clearEvt3();
            clearEvt4();
        });
    }

    OnWSClose(evt, data) {
        this.appService.permissions = '';
        this.appService.username = '';

        if (data.code === 3001) return;

        this.$mdDialog.show(this.$mdDialog.confirm()
            .cancel('No')
            .ok('Yes')
            .textContent('The server connection is closed. Do you want to open it back?')
            .clickOutsideToClose(true)
            .escapeToClose(true)
            //.focusOnOpen(false)
            //.onComplete(() => {
            //    this.appService.connect();
            )
            .then(() => {
                this.appService.connect();
            });
    }
}
