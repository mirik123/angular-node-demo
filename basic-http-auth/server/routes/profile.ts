
import DB = require('../db/authdb');
import express = require('express');
var router = express.Router();

router.get('/', function (req: express.Request, res: express.Response) {
    var dbres = DB.DB.getsingle(res.locals.authtoken);
    if (!dbres[0]) {
        res.status(500).json({ error: dbres[1] });
    }
    else {
        res.status(200).json(dbres[1]);
    }
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

    var dbres = DB.DB.update(req.body, res.locals.authtoken);
    if (!dbres[0]) {
        res.status(500).json({ error: dbres[1] });
    }
    else {
        res.status(200).end();
    }
});

module.exports = router;