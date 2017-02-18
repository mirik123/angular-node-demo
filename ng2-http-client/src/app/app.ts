
/// <reference path="../../typings/index.d.ts" />

import * as _  from 'lodash';
import { NgModule, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Routes, RouterModule, CanDeactivate, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MaterialModule } from '@angular/material';

import { appService } from './app.service';
import { mainCtrl } from './main/main.controller';
import { AlertDialog, ConfirmDialog, DataDialog, KeyValuePairsPipe } from './main/dialogs';
import { loginCtrl } from './login/login.controller';
import { usermngCtrl } from './usermng/usermng.controller';
import { userprofileCtrl } from './userprofile/userprofile.controller';
import { sidenavCtrl } from './sidenav/sidenav.controller';
import { sidenavDd } from './sidenav/sidenav.directive';

@NgModule({
    imports: [
        HttpModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        RouterModule.forRoot([
            {
                path: 'login',
                component: loginCtrl,
                /*canActivate: [class implements CanActivate {
                    constructor(private $appService: appService) { }
                    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
                        return true;
                    }
                }],
                canDeactivate: [class implements CanDeactivate<loginCtrl> {
                    constructor(private $appService: appService) { }
                    canDeactivate(component: loginCtrl, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
                        return !!this.$appService.authtoken;
                    }
                }]*/
            },
            {
                path: 'sidenav',
                component: sidenavCtrl,
                /*canActivate: [class implements CanActivate {
                    constructor(private $appService: appService) { }
                    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
                        return !!this.$appService.authtoken;
                    }
                }],*/
                //loadChildren: 'userprofile',
                children: [{
                    outlet: 'sidenav',
                    path: 'userprofile',
                    component: userprofileCtrl
                },
                {
                    outlet: 'sidenav',
                    path: 'usermng',
                    component: usermngCtrl
                }]
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ], { enableTracing: true })
    ],
    providers: [appService],
    declarations: [mainCtrl, loginCtrl, usermngCtrl, userprofileCtrl, sidenavCtrl, sidenavDd, AlertDialog, ConfirmDialog, DataDialog, KeyValuePairsPipe],
    bootstrap: [mainCtrl]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);

class appConfig {
    constructor($mdThemingProvider, $mdDateLocaleProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .backgroundPalette('blue-grey');

        $mdDateLocaleProvider.formatDate = function (date: Date) {
            return date && moment(date).format('DD/MM/YYYY');
        };

        /*var localeDate = moment.localeData();
        $mdDateLocale.months = localeDate._months;
        $mdDateLocale.shortMonths = localeDate._monthsShort;
        $mdDateLocale.days = localeDate._weekdays;
        $mdDateLocale.shortDays = localeDate._weekdaysMin;
        $mdDateLocale.msgCalendar = $translate.instant('MSG_CALENDAR');
        $mdDateLocale.msgOpenCalendar = $translate.instant('MSG_OPEN_CALENDAR');*/

        $mdDateLocaleProvider.parseDate = function (dateString: string) {
            var m = moment(dateString, 'DD/MM/YYYY', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $mdDateLocaleProvider.isDateComplete = function (dateString: string) {
            var m = moment(dateString, 'DD/MM/YYYY', true);
            return m.isValid();
        };

        /*$httpProvider.interceptors.push(['$q', function ($q) {
            return {
                request: function (config) { return config; },
                response: function (response) { return $q.reject(response); }
            };
        }]);*/

        //$locationProvider.html5Mode(true);    

        $urlRouterProvider.otherwise('/login');
    }
}
