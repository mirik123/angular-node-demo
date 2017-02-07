import * as _ from 'lodash';

import { Inject, Component, ViewContainerRef, OnInit } from '@angular/core';

@Component({
    selector: 'sidenav-dd',
    template: `<h1>{{options}}</h1>`,
    inputs: ['options']
})
export class sidenavDd {
    public options: string;

    constructor($scope, $element, $attrs) { 
        $scope.title = 'DIRECTIVE';
    }
}