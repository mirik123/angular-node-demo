import * as _ from 'lodash';

import { Inject, Component, ViewChild, ViewContainerRef, OnInit, OnChanges, SimpleChanges, SimpleChange, ElementRef, AfterViewInit, Renderer } from '@angular/core';

@Component({
    selector: 'sidenav-dd',
    template: `<h1 #sidenavelem>{{options}}</h1>`,
    inputs: ['options']
})
export class sidenavDd implements OnChanges, AfterViewInit {
    public options: string;
    public title: string;

    @ViewChild('sidenavelem') sidenavelem: ElementRef;

    constructor(private renderer: Renderer) { 
        this.title = 'DIRECTIVE';
    }

    ngAfterViewInit() {
        //this.sidenavelem.nativeElement.value = ''; 
        this.sidenavelem.nativeElement.querySelector('h1').focus();
        this.renderer.invokeElementMethod(this.sidenavelem.nativeElement, 'focus');
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('ngOnChanges = ' + _(changes).toPairs().reduce((x, y) => x + ',' + y[0] + '=' + (<SimpleChange>y[1]).currentValue, ''));
    }
}