
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

    public $rootScope: ng.IRootScopeService;
    public title: any;
    public username: string = '';
    public permissions: string = '';
    public host: string = 'ws://localhost:8080'; //'wss://localhost:8443';

    static $inject = ['$rootScope'];
    constructor($rootScope) {
        this.$rootScope = $rootScope;
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
            console.error('WebSocket message received: ', evt);
            this.$rootScope.$emit(evt.data.target, evt.data.content);
        };
    }

    public get isConnected() {
        return this.ws && (this.ws.readyState === this.ws.OPEN || this.ws.readyState === this.ws.CONNECTING);
    };

    public logout(reason:string = 'OK') {
        this.ws.close(200, reason);
        this.permissions = '';
        this.username = '';
        this.title.value = '';       
    }

    public send(target:string, content) {
        this.ws.send({ target: target, content: content});
    }
}
