import * as _ from 'lodash';
import { appService } from '../app.service';
import { ConfirmDialog, DataDialog } from '../main/dialogs';

import { Inject, Component, OnInit, Pipe, PipeTransform, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';

@Pipe({
    name: 'myfilter',
    pure: false
})
export class filterPipe implements PipeTransform {
    private cachedOrder: string;
    private cachedSearch: any;
    private cachedData: any[];
    private cachedDataChanged: number;

    transform(items: any[], searchform: any, order: string, dtchanged: number): any[] {
        if (!items || !searchform && !order) {
            this.cachedData = items;
            this.cachedSearch = _.clone(searchform);
            this.cachedOrder = order;
            this.cachedDataChanged = dtchanged;
            return items;
        }

        if (order !== this.cachedOrder || !_.isEqual(searchform, this.cachedSearch) || dtchanged !== this.cachedDataChanged) {
            this.cachedData = _(items)
                .filter(row =>
                    (!searchform.username || !row.username || row.username.toLowerCase().indexOf(searchform.username.toLowerCase()) > -1) &&
                    (!searchform.permissions || !row.permissions || row.permissions.toLowerCase().indexOf(searchform.permissions.toLowerCase()) > -1) &&
                    (!searchform.email || !row.email || row.email.toLowerCase().indexOf(searchform.email.toLowerCase()) > -1) &&
                    (!searchform.birthdateFrom || !row.birthdate || moment(searchform.birthdateFrom).isSameOrBefore(row.birthdate, 'day')) &&
                    (!searchform.birthdateTo || !row.birthdate || moment(searchform.birthdateTo).isSameOrAfter(row.birthdate, 'day')))
                .sortBy(['newrecord', order])
                .value();

            this.cachedSearch = _.clone(searchform);
            this.cachedOrder = order;
            this.cachedDataChanged = dtchanged;
        }

        return this.cachedData;
    }
}

@Component({
    selector: 'usermng-ctrl',
    templateUrl: 'usermng.html',
    //changeDetection: ChangeDetectionStrategy.OnPush
})
export class usermngCtrl implements OnInit {
    title: string;    
    editmode: boolean;
    httpError = null;
    maxDate: Date;

    tabledata = {
        table: [],
        filtered: {
            get: () => {
                return _(this.tabledata.table)
                    .filter(row =>
                        (!this.searchform.username || !row.username || row.username.toLowerCase().indexOf(this.searchform.username.toLowerCase()) > -1) &&
                        (!this.searchform.permissions || !row.permissions || row.permissions.toLowerCase().indexOf(this.searchform.permissions.toLowerCase()) > -1) &&
                        (!this.searchform.email || !row.email || row.email.toLowerCase().indexOf(this.searchform.email.toLowerCase()) > -1) &&
                        (!this.searchform.birthdateFrom || !row.birthdate || moment(this.searchform.birthdateFrom).isSameOrBefore(row.birthdate, 'day')) &&
                        (!this.searchform.birthdateTo || !row.birthdate || moment(this.searchform.birthdateTo).isSameOrAfter(row.birthdate, 'day')))
                    .sortBy(['newrecord', this.tabledata.order])
                    .value();
            }
        },
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
        email: ''   
    };

    constructor(private appService: appService, private $mdDialog: MdDialog, private cd: ChangeDetectorRef) {
        this.title = 'Users Management';
        this.editmode = false;
        this.maxDate = new Date();

        appService.title.value = this.title;        
    }

    ngOnInit() {
        this.reload();
    }

    RerenderView() {
        this.cd.detectChanges();
        this.cd.markForCheck();
    }

    showDetails(row) {
        var cprow = _.clone(row);
        delete cprow.$$hashKey;

        if (cprow.birthdate) cprow.birthdate = moment.utc(cprow.birthdate).format();

        var dialogRef = this.$mdDialog.open(DataDialog);
        dialogRef.componentInstance.title = 'Info';
        dialogRef.componentInstance.content = cprow;
        dialogRef.componentInstance.okbtn = 'OK';
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
            .subscribe(dt => {
                console.log('loaded users data', dt.json());
                this.tabledata.table = dt.json();
                this.httpError = null;

                _.each(this.tabledata.table, itm => { itm.birthdate = moment.utc(itm.birthdate).toDate(); });

                this.tabledata.selected = null;
                this.tabledata.selectedcopy = null;
                this.tabledata.page = 1;
                this.resetfilters();
            },
            err => {
                this.httpError = err;
                console.error('failed to load users data', err);
            });
    }

    save(row) {       
        if (!this.tabledata.selected) return;
         
        row = _.pick(row, ['username', 'password', 'permissions', 'email', 'birthdate']);
        if (row.birthdate) row.birthdate = moment.utc(row.birthdate).format();

        if (this.tabledata.selected.newrecord) {
            this.appService.http('/api/users', 'PUT', {}, row)
                .subscribe(dt => {
                    this.httpError = null;

                    delete this.tabledata.selected.newrecord;
                    this.tabledata.selected = null;
                    this.tabledata.selectedcopy = null;
                    console.log('created new users data', dt.json());
                },
                err => {
                    this.httpError = err;
                    console.error('failed to create new users data', err);
                });
        }
        else {
            this.appService.http('/api/users', 'POST', {}, row)
                .subscribe(dt => {
                    this.httpError = null;
                    this.tabledata.selected = null;
                    this.tabledata.selectedcopy = null;
                    console.log('saved users data', dt.json());
                },
                err => {
                    this.httpError = err;
                    console.error('failed to save users data', err);
                });
        }
    };

    remove(row) {
        var dialogRef = this.$mdDialog.open(ConfirmDialog);
        dialogRef.componentInstance.title = 'Confirmation';
        dialogRef.componentInstance.message = 'Are you sure you want to delete this user?';
        dialogRef.componentInstance.okbtn = 'Yes';
        dialogRef.componentInstance.cancelbtn = 'No';
        dialogRef.afterClosed()
            .subscribe(() => {
                this.appService.http('/api/users/' + row.username, 'DELETE')
                    .subscribe(dt => {
                        this.httpError = null;
                        this.tabledata.selected = null;
                        this.tabledata.selectedcopy = null;
                        console.log('deleted users data', dt.json());
                        _.remove(this.tabledata.table, { username: row.username });
                    },
                    err => {
                        this.httpError = err;
                        console.error('failed to delete users data', err);
                    });
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