﻿import * as _ from 'lodash';
import { IAppService } from '../app.service';

export class mainCtrl {
    title: string;

    static $inject = ['$scope', '$state', 'appService', '$cookies'];
    constructor($scope, $state: ng.ui.IStateService, appService: IAppService, $cookies: ng.cookies.ICookiesService) {
        this.title = 'MAIN';
    }
}
