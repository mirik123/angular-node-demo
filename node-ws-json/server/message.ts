
import { Utils } from './utils';
import WebSocket = require("ws");

export function message(data: any, ip: string, client: WebSocket) {
    switch (data.target) {
        case 'login':
            if (!data.content.username || !data.content.password) {
                client.send({ error: 'user or password are empty' });
                return;
            }

            if (data.content.username.length > 32 || data.content.password.length > 32) {
                client.send({ error: 'user or password are too long' });
                return;
            }

            var dbres = Utils.login(data.content.username, data.content.password, ip);
            if (!dbres[0]) {
                client.send({ error: dbres[1] });
            }
            else {
                client['session'] = { username: dbres[1], permissions: dbres[2] };
                client.send(client['session']);
            }

        case 'logout':
            client['session'] = null;
            client.close(200, { message: 'planned closure' });

        case 'profile':
            var session = client['session'];
            switch (data.content.action) {
                case 'get':
                    var dbres = Utils.getsingle(session.username);
                    if (!dbres[0]) {
                        client.send({ error: dbres[1] });
                    }
                    else {
                        client.send(dbres[1]);
                    }

                case 'set':
                    if (!data.content.username || !data.content.birthdate || !data.content.email) {
                        client.send({ error: 'required parameters are empty' });
                        return;
                    }

                    if (data.content.username.length > 32 || data.content.birthdate.length > 32 || data.content.email.length > 32 || data.content.password && data.content.password.length > 32) {
                        client.send({ error: 'required parameters are too long' });
                        return;
                    }

                    if (session.permissions !== 'admin' && session.username !== data.content.username) {
                        client.send({ error: 'operation requires special permission' });
                        return;
                    }

                    if (session.permissions !== 'admin') data.content.permissions = '';

                    var dbres = Utils.update(data.content);
                    if (!dbres[0]) {
                        client.send({ error: dbres[1] });
                    }
                    else {
                        client.send({});
                    }
            }

        case 'users':
            var session = client['session'];
            switch (data.content.action) {
                case 'get':
                    if (session.permissions !== 'admin') {
                        client.send({ error: 'this operation requires special permission' });
                        return;
                    }

                    var dbres = Utils.getall();
                    if (!dbres[0]) {
                        client.send({ error: dbres[1] });
                    }
                    else {
                        client.send(dbres[1]);
                    }

                case 'set':
                    if (!data.content.username || !data.content.birthdate || !data.content.email) {
                        client.send({ error: 'required parameters are empty' });
                        return;
                    }

                    if (data.content.username.length > 32 || data.content.birthdate.length > 32 || data.content.email.length > 32 || data.content.password && data.content.password.length > 32) {
                        client.send({ error: 'required parameters are too long' });
                        return;
                    }

                    if (session.permissions !== 'admin') {
                        client.send({ error: 'this operation requires special permission' });
                        return;
                    }

                    var dbres = Utils.update(data.content);
                    if (!dbres[0]) {
                        client.send({ error: dbres[1] });
                    }
                    else {
                        client.send({});
                    }

                case 'new':
                    if (!data.content.username || !data.content.permissions || !data.content.birthdate || !data.content.email) {
                        client.send({ error: 'required parameters are empty' });
                        return;
                    }

                    if (data.content.username.length > 32 || data.content.permissions && data.content.permissions.length > 32 ||
                        data.content.birthdate.length > 32 || data.content.email.length > 32 || data.content.password && data.content.password.length > 32) {
                        client.send({ error: 'required parameters are too long' });
                        return;
                    }

                    if (session.permissions !== 'admin') {
                        client.send({ error: 'this operation requires special permission' });
                        return;
                    }

                    var dbres = Utils.add(data.content);
                    if (!dbres[0]) {
                        client.send({ error: dbres[1] });
                    }
                    else {
                        client.send({});
                    }

                case 'delete':
                    if (!data.content.username) {
                        client.send({ error: 'username is empty' });
                        return;
                    }

                    if (session.permissions !== 'admin') {
                        client.send({ error: 'this operation requires special permission' });
                        return;
                    }

                    if (session.username === data.content.username) {
                        client.send({ error: 'you cannot remove yourself' });
                        return;
                    }

                    var dbres = Utils.remove(data.content.username);
                    if (!dbres[0]) {
                        client.send({ error: dbres[1] });
                    }
                    else {
                        client.send({});
                    }
            } 
    }
};
