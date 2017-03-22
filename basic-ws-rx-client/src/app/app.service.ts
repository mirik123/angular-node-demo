
import Rx = require('rxjs/Rx');
import { NextObserver } from 'rxjs/Observer';

export class rxEvent {
    target?: string; 
    error?: string; 
    content?: any;
}

export interface IAppService {
    events: Rx.Subject<rxEvent>;
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

    public title: any;
    public username: string = '';
    public permissions: string = '';
    public wsurl: string = 'ws://localhost:8080/ws'; //'wss://localhost:8443/ws';
    public httpurl: string = 'http://localhost:8080/api'; //'https://localhost:8443/api';
    public events: Rx.Subject<rxEvent>;
    //public observable: Rx.Observable<rxEvent>;
    //public observer: Rx.Observer<rxEvent>;

    static $inject = ['$state', '$http', '$cookies'];
    constructor(private $state: ng.ui.IStateService, private $http: ng.IHttpService, private $cookies: ng.cookies.ICookiesService) {
        this.title = { value: '' };
        this.events = new Rx.Subject<rxEvent>();

        //this.observable = Rx.Observable.create((observer: Rx.Observer<rxEvent>) => this.observer = observer).share();

        //var subj = new Rx.Subject<rxEvent>();
        //subj.n

        //var subj = Rx.Subject.webSocket(this.wsurl);
        //subj.
    }

    public connect() {
        this.disconnect();

        if (!this.$cookies.get('connect.sid')) {
            this.$http.get(this.httpurl)
                .then(val => {
                    this.SetRxEvents();
                });
        }
        else {
            this.SetRxEvents();
        }
    }

    private SetRxEvents() {
        this.ws = new WebSocket(this.wsurl);

        this.ws.onopen = evt => {
            console.log('WebSocket connected: ', evt);
            this.events.next({ target: 'websocket@open', content: evt });
        };

        this.ws.onclose = evt => {
            console.log('WebSocket closed: ', evt);
            if (evt.wasClean) {
                this.events.next({ target: 'websocket@close', content: evt });
                //this.events.complete();
            }
            else {
                this.events.next({ target: 'websocket@error', content: evt });
                //this.events.error(evt);
            }
        };

        this.ws.onerror = evt => {
            console.error('WebSocket error: ', evt);
            this.events.next({ target: 'websocket@error', content: evt });
            //this.events.error(evt);
        };

        this.ws.onmessage = evt => {
            console.log('WebSocket message received: ', evt);

            if (!evt) {
                console.error('message is empty');
                this.events.next({ target: 'websocket@error', error: 'message is empty' });
                return;
            }

            var data: rxEvent;
            try {
                data = JSON.parse(evt.data);
            }
            catch (err) {
                console.error('message error: ', err);

                err.source = evt.data;
                this.events.next({ target: 'websocket@error', content: err, error: err.message });
                return;
            }

            if (data.error) {
                console.error('message returned error: ', data.error);
            }

            if (!data.target) {
                console.error('message target is empty', data);
                this.events.next({ target: 'websocket@error', content: data, error: 'message target is empty' });
                return;
            }

            if (!data.content && !data.error) {
                console.error('message content is empty', data);
                data.error = 'message content is empty';
            }

            this.events.next(data);
        };
    }

    public send(target: string, content: any) {
        if(target === 'logout') this.$cookies.remove('connect.sid');

        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.events.next({ target: target, error: 'server is disconnected' });
            return;
        }

        try {
            console.log('WebSocket message sent: ', { target: target, content: content });
            this.ws.send(JSON.stringify({ target: target, content: content }));
        }
        catch (err) {
            console.log('WebSocket message sent error: ', err);
            this.events.next({ target: target, error: 'server error' });
        }
    }

    public disconnect() {
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) this.ws.close(3001, 'planned close event');
    }

    public get readyState() {
        return this.ws && this.ws.readyState;
    };
}
