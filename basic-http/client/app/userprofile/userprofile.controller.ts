
export class userprofileCtrl {
    title: string;
    $state: ng.ui.IStateService;
    appService: IAppService;
    $mdDialog: ng.material.IDialogService;
    httpError = {};
    maxDate: Date;
    profilemodel = {
        username: '',
        password: '',
        permissions: '',
        birthdate: null,
        email: ''
    };

    static $inject = ['$state', 'appService', '$mdDialog'];
    constructor($state: ng.ui.IStateService, appService: IAppService, $mdDialog: ng.material.IDialogService) {
        this.$state = $state;
        this.appService = appService;
        this.$mdDialog = $mdDialog;
        this.title = 'User Profile';
        this.maxDate = new Date();

        if (!this.appService.authtoken) return;

        this.appService.title.value = this.title;
        this.reload();
    }

    reload() {
        this.appService.http('/api/profile', 'GET')
            .then((dt) => {
                this.profilemodel = {
                    username: this.appService.username,
                    password: '',
                    permissions: dt.data.permissions,
                    birthdate: moment.utc(dt.data.birthdate).toDate(),
                    email: dt.data.email
                };

                this.httpError = null;
                console.log('get profile', dt.data);
            },
            (dt) => {
                this.httpError = dt.data;
                console.error('profile error', dt.data);
            });
    }

    update() {
        var model = _.cloneDeep(this.profilemodel);
        model.birthdate = moment.utc(model.birthdate).format();
        this.profilemodel.password = '';

        this.appService.http('/api/profile', 'POST', {}, model)
            .then((dt) => {
                this.httpError = null;
                console.log('updated profile', dt.data);

                this.$mdDialog.show(
                    this.$mdDialog.alert()
                    .title('Info')
                    .textContent('Profile has been updated') 
                        .ok('OK')
                );
            },
            (dt) => {
                this.httpError = dt.data;                
                console.error('profile error', dt.data);
            });
    }
}