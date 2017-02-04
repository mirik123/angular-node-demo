/// <reference path="../../node_modules/@types/angular/index.d.ts" />
/// <reference path="../../node_modules/@types/angular-cookies/index.d.ts" />
/// <reference path="../../node_modules/@types/angular-material/index.d.ts" />
/// <reference path="../../node_modules/@types/angular-ui-router/index.d.ts" />
/// <reference path="../../typings/index.d.ts" />

import * as _  from 'lodash';
import angular = require('angular');
import { IAppService } from './app.service';


var app = angular.module('app', ['app.templates', 'ngAria', 'ngMaterial', 'ngMdIcons', 'ngMessages', "ui.router", "ngAnimate", 'md.data.table', 'ngCookies']);

app.run(['$rootScope', 'appService', '$state', function ($rootScope, appService: IAppService, $state) {
    //$rootScope._ = window._;

    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
        if (toState.name.indexOf('login') < 0 && !appService.username) {
            event.preventDefault(); // stop current execution
            $state.go('login'); // go to login
        }
    });

    $rootScope.$on("$stateChangeCancel", function (event, toState, toParams, fromState, fromParams) {
        console.warn("cancel state: " + toState.name);
    });
}]);

app.config(['$mdThemingProvider', '$mdDateLocaleProvider',
    function ($mdThemingProvider, $mdDateLocaleProvider) {

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
}]);

app.config(["$stateProvider", "$urlRouterProvider", '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {

        //$locationProvider.html5Mode(true);    
        $stateProvider.state('login', {
            url: '/login',
            title: 'Login',
            templateUrl: 'login/login.html',
            controller: 'loginCtrl',
            controllerAs: 'vm'
        });

        $stateProvider.state('sidenav.userprofile', {
            url: '/userprofile',
            title: 'User Profile',
            templateUrl: 'userprofile/userprofile.html',
            controller: 'userprofileCtrl',
            controllerAs: 'vm'
        });

        $stateProvider.state('sidenav', {
            url: '/sidenav',
            title: 'SideNav',
            templateUrl: 'sidenav/sidenav.html',
            controller: 'sidenavCtrl',
            controllerAs: 'vm'
        });

        $stateProvider.state('sidenav.usermng', {
            url: '/usermng/:username',
            title: 'User Management',
            templateUrl: 'usermng/usermng.html',
            controller: 'usermngCtrl',
            controllerAs: 'vm'
        });

        $urlRouterProvider.otherwise('/login');
    }]);

app.service("appService", require('./app.service').appService);
app.controller("mainCtrl", require('./main/main.controller').mainCtrl);
app.controller("loginCtrl", require('./login/login.controller').loginCtrl);
app.controller("usermngCtrl", require('./usermng/usermng.controller').usermngCtrl);
app.controller("userprofileCtrl", require('./userprofile/userprofile.controller').userprofileCtrl);
app.controller("sidenavCtrl", require('./sidenav/sidenav.controller').sidenavCtrl);
app.component("sidenavDd", new (require('./sidenav/sidenav.directive')).sidenavDd());

//import * as appService from "./main/app.service";
//import {appService} from "./main/app.service";
