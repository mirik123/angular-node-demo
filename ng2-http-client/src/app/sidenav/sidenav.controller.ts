import * as _ from 'lodash';
import { appService } from '../app.service';
import { ConfirmDialog, DataDialog } from '../main/dialogs';

import { Inject, Component, ViewContainerRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';

@Component({
    selector: 'sidenav',
    templateUrl: 'sidenav.html'
})
export class sidenavCtrl {
    get title() {
        return this.appService.title.value ? this.appService.username + ' - ' + this.appService.title.value : '';
    };

    constructor(
        private $state: Router,
        private appService: appService
    ) {}

    selectTab(target: string) {
        this.$state.navigateByUrl((target !== '/login' ? '/sidenav/' : '') + target);
    }
     
    logout() {
        this.appService.http('/api/logout', 'POST');
        this.appService.permissions = '';
        this.appService.authtoken = '';
        this.appService.username = '';
        this.appService.title.value = '';
        Cookie.delete('angular-demo-authtoken');
         
        this.selectTab('login');
    }
}