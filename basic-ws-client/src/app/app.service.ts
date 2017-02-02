
export interface IAppService {
    $rootScope: ng.IRootScopeService;
    title: { value: string };
    username: string;
    permissions: string;
    host: string;
    isConnected: boolean;

    connect();
    logout(reason?:string);
    send(target:string, content);
}

export class appService implements IAppService {
    private ws: WebSocket;
    private $state: ng.ui.IStateService;

    public $rootScope: ng.IRootScopeService;
    public title: any;
    public username: string = '';
    public permissions: string = '';
    public host: string = 'ws://localhost:8080'; //'wss://localhost:8443';

    static $inject = ['$rootScope', '$state'];
    constructor($rootScope, $state) {
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.title = { value: '' };

        this.connect();
    }

    public connect() {
        if (this.isConnected) this.ws.close(200, 'planned close');

        this.ws = new WebSocket(this.host);
        this.ws.onopen = evt => {
            console.log('WebSocket connected: ', evt);
            this.$rootScope.$emit('ws_open', evt);
        };

        this.ws.onclose = evt => {
            console.log('WebSocket closed: ', evt);
            this.$rootScope.$emit('ws_close', evt);
        };

        this.ws.onerror = evt => {
            console.error('WebSocket error: ', evt);
            this.$rootScope.$emit('ws_error', evt);
        };

        this.ws.onmessage = evt => {
            console.log('WebSocket message received: ', evt);

            if (!evt) {
                console.error('message is empty');
                return;
            }

            var data: { target?: string, error?: string, content?: any } = {};
            try {
                data = JSON.parse(evt.data);
            }
            catch (err) {
                console.error('message error: ', err)
                return;
            }

            if (data.error) {
                console.error('message returned error: ', data.error);
            }

            if (!data.target) {
                console.error('message target is empty', data);
                return;
            }

            if (!data.content && !data.error) {
                console.error('message content is empty', data);
                data.error = 'message content is empty';
            }

            this.$rootScope.$emit(data.target, data);
        };
    }

    public get isConnected() {
        return this.ws && (this.ws.readyState === this.ws.OPEN || this.ws.readyState === this.ws.CONNECTING);
    };

    public logout(reason:string = 'OK') {
        this.ws.close(1000, reason);
        this.permissions = '';
        this.username = '';
        this.title.value = '';       
    }

    public send(target: string, content: any) {
        if (!this.isConnected) {
            if (this.$state.current.name !== 'login') {                
                this.$state.go('login');
            }
            else {
                this.connect();
                this.$rootScope.$emit(target, { error: 'server is disconnected, please try again' });
            }

            return;
        }

        try {
            var data = { target: target, content: content };
            console.log('WebSocket message sent: ', data);
            this.ws.send(JSON.stringify(data));
        }
        catch (err) {
            console.log('WebSocket message sent error: ', err);
            this.$rootScope.$emit(target, { error: 'server error' });
        }
    }
}
