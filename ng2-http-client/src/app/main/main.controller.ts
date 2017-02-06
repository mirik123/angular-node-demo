import * as _ from 'lodash';
import { Inject, Component } from '@angular/core';
import { appService } from '../app.service';

@Component({
    selector: 'main',
    template: `<div>
            <script type="text/ng-template" id="error-messages">
                <div ng-message="required">This field is required</div>
                <div ng-message="minlength">This field is too short</div>
                <div ng-message="maxlength">This field is too long</div>
                <div ng-message="min">This field is too short</div>
                <div ng-message="max">This field is too long</div>
                <div ng-message="email">Field has illegal characters</div>
            </script>

            <router-outlet name="mainview" layout-fill></router-outlet>
        </div>`,
    styleUrls: [
        'app.scss'
    ]
})
export class mainCtrl {
    title: string;

    constructor(private appService: appService) {
        this.title = 'MAIN';
    }
}
