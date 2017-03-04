import * as _ from 'lodash';

import { Inject, Component, ViewChild, ViewContainerRef, OnInit, OnChanges, SimpleChanges, SimpleChange, ElementRef, AfterViewInit, Renderer, Attribute } from '@angular/core';

@Component({
    selector: 'sidenav-dd',
    template: `<h1 #sidenavelem>{{options}}</h1>`,
                    //<ng-content select=".my-component-title"></ng-content>
    inputs: ['options']
})
export class sidenavDd implements OnChanges, AfterViewInit {
    public options: string;
    public title: string;

    //@Input() public options: string;
    @ViewChild('sidenavelem') sidenavelem: ElementRef;

    //http://blog.rangle.io/dynamically-creating-components-with-angular-2/
    //@ViewChild('sidenavelem', { read: ViewContainerRef }) sidenavelem: ViewContainerRef;


    constructor(private renderer: Renderer, @Attribute("test") test  ) { 
        this.title = 'DIRECTIVE';
    }

    ngAfterViewInit() {
        //this.sidenavelem.nativeElement.value = ''; 
        //var myattr = this.sidenavelem.nativeElement.getAttribute("myattr");
        //this.sidenavelem.nativeElement.querySelector('h1').focus();
        //this.renderer.invokeElementMethod(this.sidenavelem.nativeElement, 'focus');
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('ngOnChanges = ' + _(changes).toPairs().reduce((x, y) => x + ',' + y[0] + '=' + (<SimpleChange>y[1]).currentValue, ''));
    }
}