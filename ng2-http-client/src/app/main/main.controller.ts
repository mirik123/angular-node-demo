import * as _ from 'lodash';
import { Inject, Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { appService } from '../app.service';

@Component({
    selector: 'main-ctrl',
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
        </div>`
})
export class mainCtrl {
    title: string;

    constructor(private appService: appService, private router: Router) {
        this.title = 'MAIN';

        router.events.subscribe(evt => {
            if (event instanceof NavigationStart) {
                if ((<NavigationStart>event).url.indexOf('login') < 0 && !appService.authtoken) {
                    event.preventDefault(); // stop current execution
                    router.navigateByUrl('/login'); // go to login
                }
            }
        });
    }
}
