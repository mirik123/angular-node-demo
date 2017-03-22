import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class mainCtrl {
    title: string;

    static $inject = ['$scope', '$state', 'appService', '$mdDialog'];
    constructor(private $scope, private $state: ng.ui.IStateService, private appService: IAppService, private $mdDialog: ng.material.IDialogService) {
        this.title = 'MAIN';

        var clearEvt1 = appService.events.filter(x => x.target === 'websocket@open').subscribe(data => this.appService.send('login', {}));
        var clearEvt2 = appService.events.filter(x => x.target === 'websocket@close').subscribe(data => this.OnWSClose(data));
        var clearEvt3 = appService.events.filter(x => x.target === 'websocket@error').subscribe(data => this.OnWSError(data));
        var clearEvt4 = appService.events.filter(x => x.target === 'login').subscribe(data => {
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
            clearEvt1.unsubscribe();
            clearEvt2.unsubscribe();
            clearEvt3.unsubscribe();
            clearEvt4.unsubscribe();
        });
    }

    OnWSError(data) {
        console.error('error: ', data);
    }

    OnWSClose(data) {
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
