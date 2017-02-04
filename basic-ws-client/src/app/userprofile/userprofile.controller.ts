import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class userprofileCtrl {
    title: string;
    $state: ng.ui.IStateService;
    appService: IAppService;
    $mdDialog: ng.material.IDialogService;
    httpError = null;
    maxDate: Date;
    profilemodel = {
        username: '',
        password: '',
        permissions: '',
        birthdate: null,
        email: ''
    };

    static $inject = ['$state', 'appService', '$mdDialog', '$scope'];
    constructor($state: ng.ui.IStateService, appService: IAppService, $mdDialog: ng.material.IDialogService, $scope: ng.IScope) {
        this.$state = $state;
        this.appService = appService;
        this.$mdDialog = $mdDialog;
        this.title = 'User Profile';
        this.maxDate = new Date();

        this.appService.title.value = this.title;


        var clearEvt1 = this.appService.$rootScope.$on('profile@get', this.OnMessage.bind(this));
        var clearEvt2 = this.appService.$rootScope.$on('profile@set', this.OnMessage.bind(this));

        $scope.$on("$destroy", () => {
            clearEvt1();
            clearEvt2();
        });

        this.reload();
    }

    OnMessage(evt, data) {
        var action = evt.name.split('@')[1];
        this.httpError = null;

        if (!data) {
            this.httpError = 'incorrect request';
            return;
        }

        if (data.error) {
            this.httpError = data.error;
            console.error('profile error', data);
            return;
        }

        if (action === 'get') {
            this.profilemodel = {
                username: this.appService.username,
                password: '',
                permissions: data.content.permissions,
                birthdate: moment.utc(data.content.birthdate).toDate(),
                email: data.content.email
            };

            console.log('get profile', data);
        }
        else if (action === 'set') {
            console.log('updated profile', data);

            this.$mdDialog.show(
                this.$mdDialog.alert()
                    .title('Info')
                    .textContent('Profile has been updated')
                    .ok('OK')
            );
        }
        else {
            this.httpError = 'unknown action: ' + action;
        }
    }

    reload() {
        this.appService.send('profile@get', {});
    }

    update() {
        var model = _.cloneDeep(this.profilemodel);
        this.profilemodel.password = '';

        model.birthdate = moment.utc(model.birthdate).format();

        this.appService.send('profile@set', model);
    }
}