
import DB = require('../db/authdb');
import express = require('express');
var router = express.Router();

router.post('/', function (req: express.Request, res: express.Response) {
    if (!req.body.username || !req.body.password) {
        res.status(500).json({ error: 'user or password are empty' });
        return;
    }

    if (req.body.username.length > 32 || req.body.password.length > 32) {
        res.status(500).json({ error: 'user or password are too long' });
        return;
    }

    var dbres = DB.DB.login(req.body.username, req.body.password, req.ip);
    if (!dbres[0]) {
        res.status(dbres[1]).json({ error: dbres[2] });
    }
    else {
        var validate = DB.DB.validate(dbres[2]);
        if (!validate[0]) {
            res.status(validate[1]).json({ error: validate[2] });
        }
        else {
            //res.redirect(303, '/api/users');
            //res.status(303).set('Location', '/api/users');

            res.status(validate[1]).json({ authtoken: dbres[2], permissions: validate[2][0] });
        }
    }
});

module.exports = router;