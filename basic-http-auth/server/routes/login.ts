
import DB = require('../db/authdb');
import express = require('express');
var router = express.Router();

router.post('/', function (req: express.Request, res: express.Response) {
    if (!req.body.username || !req.body.password) {
        res.status(500).json({ error: 'user or password are empty' });
        return;
    }

    if (req.body.username.length > 16 || req.body.password.length > 16) {
        res.status(500).json({ error: 'user or password are too long' });
        return;
    }

    var dbres = DB.DB.login(req.body.username, req.body.password, req.ip);
    if (!dbres[0]) {
        res.status(500).json({ error: dbres[1] });
    }
    else {
        var validate = DB.DB.validate(dbres[1]);
        if (!validate[0]) {
            res.status(500).json({ error: validate[1] });
        }
        else {
            res.status(200).json({ authtoken: dbres[1], permissions: validate[1][0] });
        }
    }
});

module.exports = router;