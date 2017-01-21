
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

        if (!this.appService.authtoken) return;

        appService.title.value = this.title;
        this.reload();
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
        this.appService.http('/api/users', 'GET')
            .then(dt => {
                console.log('loaded users data', dt.data);
                this.tabledata.table = dt.data;
                this.httpError = null;

                _.each(this.tabledata.table, itm => { itm.birthdate = moment.utc(itm.birthdate).toDate(); });

                this.tabledata.selected = null;
                this.tabledata.selectedcopy = null;
                this.tabledata.page = 1;
                this.resetfilters();
            },
            dt => {
                this.httpError = dt.data;
                console.error('failed to load users data', dt.data);
            });
    }

    save(row) {        
        row = _.pick(row, ['username', 'password', 'permissions', 'email', 'birthdate']);
        row.birthdate = moment.utc(row.birthdate).format();

        if (this.tabledata.selected.newrecord) {
            this.appService.http('/api/users', 'PUT', {}, row)
                .then(dt => {
                    this.httpError = null;

                    delete this.tabledata.selected.newrecord;
                    this.tabledata.selected = null;
                    this.tabledata.selectedcopy = null;
                    console.log('created new users data', dt.data);
                },
                dt => {
                    this.httpError = dt.data;
                    console.error('failed to create new users data', dt.data);
                });
        }
        else {
            this.appService.http('/api/users', 'POST', {}, row)
                .then(dt => {
                    this.httpError = null;
                    this.tabledata.selected = null;
                    this.tabledata.selectedcopy = null;
                    console.log('saved users data', dt.data);
                },
                dt => {
                    this.httpError = dt.data;
                    console.error('failed to save users data', dt.data);
                });
        }
    };

    remove(row) {
        this.appService.http('/api/users/' + row.username, 'DELETE')
            .then(dt => {
                this.httpError = null;
                this.tabledata.selected = null;
                this.tabledata.selectedcopy = null;
                console.log('deleted users data', dt.data);
                _.remove(this.tabledata.table, { username: row.username });
            },
            dt => {
                this.httpError = dt.data;
                console.error('failed to delete users data', dt.data);
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