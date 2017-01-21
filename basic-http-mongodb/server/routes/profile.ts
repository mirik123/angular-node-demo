
import { Utils } from '../utils';
import express = require('express');
var router = express.Router();

router.get('/', function (req: express.Request, res: express.Response) {
    Utils.getsingle(res.locals.authtoken)
        .then(dbres => {
            res.status(<number>dbres[0]).json(dbres[1]);
        }, dbres => {
            res.status(dbres[0]).json({ error: dbres[1] });
        });
});

router.post('/', function (req: express.Request, res: express.Response) {
    req.body.permissions = '';

    if (!req.body.username || !req.body.birthdate || !req.body.email) {
        res.status(500).json({ error: 'required parameters are empty' });
        return;
    }

    if (req.body.username.length > 32 || req.body.birthdate.length > 32 || req.body.email.length > 32 || req.body.password && req.body.password.length > 32) {
        res.status(500).json({ error: 'required parameters are too long' });
        return;
    }

    Utils.update(req.body, res.locals.authtoken)
        .then(dbres => {
            res.sendStatus(dbres[0]);            
        }, dbres => {
            res.status(dbres[0]).json({ error: dbres[1] });
        });
});

module.exports = router;