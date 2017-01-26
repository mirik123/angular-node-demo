
import { Utils } from '../utils';
import _ = require("lodash");
import express = require('express');
var router = express.Router();

router.get('/', async function (req: express.Request, res: express.Response) {
    try {
        var dbres = await Utils.getsingle(res.locals.authtoken);
        res.status(<number>dbres[0]).json(dbres[1]);
    }
    catch (err) {
        if (_.isArray(err) && err.length === 2) {
            res.status(<number>err[0]).json({ error: err[1] });
        }
        else {
            res.sendStatus(500);
        }
    }
});

router.post('/', async function (req: express.Request, res: express.Response) {
    req.body.permissions = '';

    if (!req.body.username || !req.body.birthdate || !req.body.email) {
        res.status(500).json({ error: 'required parameters are empty' });
        return;
    }

    if (req.body.username.length > 32 || req.body.birthdate.length > 32 || req.body.email.length > 32 || req.body.password && req.body.password.length > 32) {
        res.status(500).json({ error: 'required parameters are too long' });
        return;
    }

    try {
        var dbres = await Utils.update(req.body, res.locals.authtoken);
        res.sendStatus(<number>dbres[0]);    
    }
    catch (err) {
        if (_.isArray(err) && err.length === 2) {
            res.status(<number>err[0]).json({ error: err[1] });
        }
        else {
            res.sendStatus(500);
        }
    }
});

module.exports = router;