import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class usermngCtrl {
    title: string;
    $state: ng.ui.IStateService;
    $scope: any;
    $stateParams: ng.ui.IStateParamsService;
    $mdDialog: ng.material.IDialogService;
    appService: IAppService;
    editmode: boolean;
    httpError = null;
    maxDate: Date;

    tabledata = {
        table: [],
        filtered: [],
        selected: null,
        selectedcopy: null,
        get count() {
            return this.filtered.length;
        },
        order: 'username',
        limit: 3,
        page: 1,
        limitoptions: [3, 10, 50/*, {
            label: 'All',
            value: () => {
                return this.tabledata.filtered.length;
            }
        }*/]
    };

    searchform = {
        username: '',
        permissions: '',
        birthdateFrom: null,
        birthdateTo: null,
        email: '',

        filter: (row) => {
            return (!this.searchform.username || !row.username || row.username.toLowerCase().indexOf(this.searchform.username.toLowerCase()) > -1) &&
                (!this.searchform.permissions || !row.permissions || row.permissions.toLowerCase().indexOf(this.searchform.permissions.toLowerCase()) > -1) &&
                (!this.searchform.email || !row.email || row.email.toLowerCase().indexOf(this.searchform.email.toLowerCase()) > -1) &&
                (!this.searchform.birthdateFrom || !row.birthdate || moment(this.searchform.birthdateFrom).isSameOrBefore(row.birthdate, 'day')) &&
                (!this.searchform.birthdateTo || !row.birthdate || moment(this.searchform.birthdateTo).isSameOrAfter(row.birthdate, 'day'));
        }        
    };

    static $inject = ['$scope', '$state', 'appService', '$stateParams', '$mdDialog'];
    constructor($scope, $state: ng.ui.IStateService, appService: IAppService, $stateParams: ng.ui.IStateParamsService, $mdDialog: ng.material.IDialogService) {
        this.$state = $state;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$mdDialog = $mdDialog;
        this.appService = appService;
        this.title = 'Users Management';
        this.editmode = false;
        this.maxDate = new Date();

        appService.title.value = this.title;

        var clearEvt1 = appService.events.filter(x => x.target.indexOf('users@') >= 0).subscribe(this.OnMessage.bind(this), null, null);

        $scope.$on("$destroy", () => {
            clearEvt1.unsubscribe();
        });

        this.reload();
    }

    OnMessage(data) {
        var action = data.target.split('@')[1];
        this.httpError = null;

        if (!data) {
            this.httpError = 'incorrect request';
            return;
        }

        if (data.error) {
            this.httpError = data.error;
            console.error('user management error', data);
            return;
        }

        switch (action) {
            case 'get':
                console.log('loaded users data', data);
                this.tabledata.table = data.content;

                _.each(this.tabledata.table, itm => { itm.birthdate = moment.utc(itm.birthdate).toDate(); });

                this.tabledata.selected = null;
                this.tabledata.selectedcopy = null;
                this.tabledata.page = 1;
                this.resetfilters();
                break;

            case 'set':
                this.tabledata.selected = null;
                this.tabledata.selectedcopy = null;
                console.log('saved users data', data);
                break;

            case 'new':
                this.tabledata.selected = null;
                this.tabledata.selectedcopy = null;
                console.log('created new users data', data);
                break;

            case 'delete':
                this.tabledata.selected = null;
                this.tabledata.selectedcopy = null;
                console.log('deleted users data', data);
                _.remove(this.tabledata.table, { username: data.content.username });
                break;

            default:
                this.httpError = 'unknown action:' + action;
        }
    }

    showDetails(row) {
        var cprow = _.clone(row);
        delete cprow.$$hashKey;

        if (cprow.birthdate) cprow.birthdate = moment.utc(cprow.birthdate).format();

        this.$mdDialog.show({
            clickOutsideToClose: true,
            template:
            `<table style="margin:10px;max-width:750px">
                <tr ng-repeat="(key,val) in content">
                    <td style="padding-right:5px"><b>{{key}}</b></td>
                    <td><pre>{{val}}</pre></td>
                </tr>
            </table>`,
            locals: {
                content: cprow
            },
            controller: <any>['$scope', 'content', function ($scope, content) {
                $scope['content'] = content;
            }]
        });
    }

    resetfilters() {
        this.searchform.permissions = '';
        this.searchform.email = '';
        this.searchform.username = '';
        this.searchform.birthdateFrom = null;
        this.searchform.birthdateTo = null;
    }

    reload() {
        this.tabledata.table.length = 0;
        this.appService.send('users@get', {});
    }

    save(row) {       
        if (!this.tabledata.selected) return;
         
        row = _.pick(row, ['username', 'password', 'permissions', 'email', 'birthdate']);
        if (row.birthdate) row.birthdate = moment.utc(row.birthdate).format();

        if (this.tabledata.selected.newrecord) {
            this.appService.send('users@new', row);
        }
        else {
            this.appService.send('users@set', row);
        }
    };

    remove(row) {
        this.$mdDialog.show(
            this.$mdDialog.confirm()
                .cancel('No')
                .ok('Yes')
                .textContent('Are you sure you want to delete this user?')
                .clickOutsideToClose(true)
                .escapeToClose(true)
        )
        .then(() => {
            this.appService.send('users@delete', { username: row.username });
        });         
    }

    create() {
        var itm = {
            permissions: 'user',
            email: '',
            username: '',
            password: '',
            birthdate: null,
            newrecord: true
        };

        this.tabledata.table.unshift(itm);

        this.tabledata.page = 1;
        this.tabledata.selected = itm;
        this.tabledata.selectedcopy = null;
    }

    undo() {
        if (this.tabledata.selected) {
            if (this.tabledata.selected.newrecord) {
                this.tabledata.table.splice(this.tabledata.table.indexOf(this.tabledata.selected), 1);
            }
            else {
                var row = _.find(this.tabledata.table, { username: this.tabledata.selectedcopy.username });
                if (row) _.assign(row, this.tabledata.selectedcopy);
            }

            this.tabledata.selected = null;
            this.tabledata.selectedcopy = null;
        }
    }

    edit(row) {
        if (this.tabledata.selected) {
            this.undo();
        }

        this.tabledata.selected = row;
        this.tabledata.selectedcopy = _.cloneDeep(row);
    }
}