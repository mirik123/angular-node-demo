
/// <reference path="../../typings/index.d.ts" />

import * as _  from 'lodash';
import { NgModule, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';

import { appService } from './app.service';
import { mainCtrl } from './main/main.controller';
import { loginCtrl } from './login/login.controller';
import { usermngCtrl } from './usermng/usermng.controller';
import { userprofileCtrl } from './userprofile/userprofile.controller';
import { sidenavCtrl } from './sidenav/sidenav.controller';
import { sidenavDd } from './sidenav/sidenav.directive';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
        RouterModule.forRoot([
            {
                outlet: 'mainview',
                path: '',
                redirectTo: '/login',
                pathMatch: 'full'
            },
            {
                outlet: 'mainview',
                path: '/login',
                component: loginCtrl
            },
            {
                outlet: 'mainview',
                path: '/sidenav',
                component: sidenavCtrl,
                children: [{
                    outlet: 'sidenav',
                    path: '/userprofile',
                    component: userprofileCtrl
                },
                {
                    outlet: 'sidenav',
                    path: '/usermng/:username',
                    component: usermngCtrl
                }]
            }
        ], { enableTracing: true })
    ],
    providers: [appService],
    declarations: [loginCtrl, usermngCtrl, userprofileCtrl, sidenavCtrl, sidenavDd],
    bootstrap: [mainCtrl]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);

class appRun {
    constructor($rootScope, appService, $state) {
        //$rootScope._ = window._;

        $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
            if (toState.name.indexOf('login') < 0 && !appService.authtoken) {
                event.preventDefault(); // stop current execution
                $state.go('login'); // go to login
            }
        });

        $rootScope.$on("$stateChangeCancel", function (event, toState, toParams, fromState, fromParams) {
            console.warn("cancel state: " + toState.name);
        });
    }
}

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
