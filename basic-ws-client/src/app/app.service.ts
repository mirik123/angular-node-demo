
export interface IAppService {
    $rootScope: ng.IRootScopeService;
    title: { value: string };
    username: string;
    permissions: string;
    readyState: number;

    connect();
    disconnect();
    send(target:string, content);
}

export class appService implements IAppService {
    private ws: WebSocket;
    private $http: ng.IHttpService;
    private $state: ng.ui.IStateService;
    private $cookies: ng.cookies.ICookiesService;

    public $rootScope: ng.IRootScopeService;
    public title: any;
    public username: string = '';
    public permissions: string = '';
    public wsurl: string = 'ws://http://ec2-54-198-80-141.compute-1.amazonaws.com:8080/ws'; //'wss://http://ec2-54-198-80-141.compute-1.amazonaws.com:8443/ws';
    public httpurl: string = 'http://ec2-54-198-80-141.compute-1.amazonaws.com:8080'; //'https://ec2-54-198-80-141.compute-1.amazonaws.com.com:8443';

    static $inject = ['$rootScope', '$state', '$http', '$cookies'];
    constructor($rootScope, $state, $http, $cookies) {
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$http = $http;
        this.$cookies = $cookies;
        this.title = { value: '' };
    }

    public connect() {
        this.disconnect();

        if (!this.$cookies.get('connect.sid')) {
            this.$http.get(this.httpurl)
                .then(() => {
                    this.ws = new WebSocket(this.wsurl);
                    this.SetWSEvents(this.ws);
                });
        }
        else {
            this.ws = new WebSocket(this.wsurl);
            this.SetWSEvents(this.ws);
        }
    }

    private SetWSEvents(ws: WebSocket) {
        ws.onopen = evt => {
            console.log('WebSocket connected: ', evt);
            this.$rootScope.$emit('websocket@open', evt);
        };

        ws.onclose = evt => {
            console.log('WebSocket closed: ', evt);
            this.$rootScope.$emit('websocket@close', evt);
        };

        ws.onerror = evt => {
            console.error('WebSocket error: ', evt);
            this.$rootScope.$emit('websocket@error', evt);
        };

        ws.onmessage = evt => {
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

    public disconnect() {
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) this.ws.close(3001, 'planned close event');
    }

    public get readyState() {
        return this.ws && this.ws.readyState;
    };

    public send(target: string, content: any) {
        if (target === 'logout') this.$cookies.remove('connect.sid');

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.$rootScope.$emit(target, { error: 'server is disconnected' });
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
