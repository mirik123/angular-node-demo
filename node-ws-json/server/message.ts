
import { Utils } from './utils';
import WebSocket = require("ws");

export function message(data: any, ip: string, session:any): { target?:string, error?:string, content?:any } {
    var action = '', target = data.target.split('@')[0];

    switch (target) {
        case 'login':
            if (session.username && session.permissions && !data.content.username) return { content: session };

            if (!data.content.username || !data.content.password) {
                return { error: 'user or password are empty' };
            }

            if (data.content.username.length > 32 || data.content.password.length > 32) {
                return { error: 'user or password are too long' };
            }

            var dbres = Utils.login(data.content.username, data.content.password, ip);
            if (!dbres[0]) {
                return { error: dbres[1] };
            }
            else {
                session.username = dbres[1];
                session.permissions = dbres[2];

                return { content: { username: dbres[1], permissions: dbres[2] } };
            }

        case 'profile':
            action = data.target.split('@')[1];
            switch (action) {
                case 'get':
                    var dbres = Utils.getsingle(session.username);
                    if (!dbres[0]) {
                        return { error: dbres[1] };
                    }
                    else {
                        return { content: dbres[1] };
                    }

                case 'set':
                    if (!data.content.username || !data.content.birthdate || !data.content.email) {
                        return { error: 'required parameters are empty' };
                    }

                    if (data.content.username.length > 32 || data.content.birthdate.length > 32 || data.content.email.length > 32 || data.content.password && data.content.password.length > 32) {
                        return { error: 'required parameters are too long' };
                    }

                    if (session.permissions !== 'admin' && session.username !== data.content.username) {
                        return { error: 'operation requires special permission' };
                    }

                    if (session.permissions !== 'admin') data.content.permissions = '';

                    var dbres = Utils.update(data.content);
                    if (!dbres[0]) {
                        return { error: dbres[1] };
                    }
                    else {
                        return {};
                    }
            }

        case 'users':
            action = data.target.split('@')[1];
            switch (action) {
                case 'get':
                    if (session.permissions !== 'admin') {
                        return { error: 'this operation requires special permission' };
                    }

                    var dbres = Utils.getall();
                    if (!dbres[0]) {
                        return { error: dbres[1] };
                    }
                    else {
                        return { content: dbres[1] };
                    }

                case 'set':
                    if (!data.content.username || !data.content.birthdate || !data.content.email) {
                        return { error: 'required parameters are empty' };
                    }

                    if (data.content.username.length > 32 || data.content.birthdate.length > 32 || data.content.email.length > 32 || data.content.password && data.content.password.length > 32) {
                        return { error: 'required parameters are too long' };
                    }

                    if (session.permissions !== 'admin') {
                        return { error: 'this operation requires special permission' };
                    }

                    var dbres = Utils.update(data.content);
                    if (!dbres[0]) {
                        return { error: dbres[1] };
                    }
                    else {
                        return { content: { username: data.content.username } };
                    }

                case 'new':
                    if (!data.content.username || !data.content.permissions || !data.content.birthdate || !data.content.email) {
                        return { error: 'required parameters are empty' };
                    }

                    if (data.content.username.length > 32 || data.content.permissions && data.content.permissions.length > 32 ||
                        data.content.birthdate.length > 32 || data.content.email.length > 32 || data.content.password && data.content.password.length > 32) {
                        return { error: 'required parameters are too long' };
                    }

                    if (session.permissions !== 'admin') {
                        return { error: 'this operation requires special permission' };
                    }

                    var dbres = Utils.add(data.content);
                    if (!dbres[0]) {
                        return { error: dbres[1] };
                    }
                    else {
                        return {};
                    }

                case 'delete':
                    if (!data.content.username) {
                        return { error: 'username is empty' };
                    }

                    if (session.permissions !== 'admin') {
                        return { error: 'this operation requires special permission' };
                    }

                    if (session.username === data.content.username) {
                        return { error: 'you cannot remove yourself' };
                    }

                    var dbres = Utils.remove(data.content.username);
                    if (!dbres[0]) {
                        return { error: dbres[1] };
                    }
                    else {
                        return { content: { username: data.content.username } };
                    }
            } 
    }
};
