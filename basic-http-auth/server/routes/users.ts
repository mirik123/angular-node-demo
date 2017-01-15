
import Utils = require('../utils');
import express = require('express');
var router = express.Router();

router.get('/', function (req: express.Request, res: express.Response) {
    var dbres = Utils.Utils.getall(res.locals.authtoken);
    if (!dbres[0]) {
        res.status(dbres[1]).json({ error: dbres[2] });
    }
    else {
        res.status(dbres[1]).json(dbres[2]);
    }
});
 
router.post('/', function (req: express.Request, res: express.Response) {
    if (!req.body.username || !req.body.permissions || !req.body.birthdate || !req.body.email) {
        res.status(500).json({ error: 'required parameters are empty' });
        return;
    }

    if (req.body.username.length > 32 || req.body.permissions && req.body.permissions.length > 32 ||
        req.body.birthdate.length > 32 || req.body.email.length > 32 || req.body.password && req.body.password.length > 32) {
        res.status(500).json({ error: 'required parameters are too long' });
        return;
    }

    var dbres = Utils.Utils.update(req.body, res.locals.authtoken);
    if (!dbres[0]) {
        res.status(dbres[1]).json({ error: dbres[2] });
    }
    else {
        res.sendStatus(dbres[1]);
    }
});


router.put('/', function (req: express.Request, res: express.Response) {
    if (!req.body.username || !req.body.permissions || !req.body.birthdate || !req.body.email) {
        res.status(500).json({ error: 'required parameters are empty' });
        return;
    }

    if (req.body.username.length > 32 || req.body.permissions && req.body.permissions.length > 32 ||
        req.body.birthdate.length > 32 || req.body.email.length > 32 || req.body.password && req.body.password.length > 32) {
        res.status(500).json({ error: 'required parameters are too long' });
        return;
    }

    var dbres = Utils.Utils.add(req.body, res.locals.authtoken);
    if (!dbres[0]) {
        res.status(dbres[1]).json({ error: dbres[2] });
    }
    else {
        res.sendStatus(dbres[1]);
    }
});

router.delete('/:username', function (req: express.Request, res: express.Response) {
    if (!req.params.username) {
        res.status(500).json({ error: 'username is empty' });
        return;
    }

    var dbres = Utils.Utils.remove(req.params.username, res.locals.authtoken);
    if (!dbres[0]) {
        res.status(dbres[1]).json({ error: dbres[2] });
    }
    else {
        res.sendStatus(dbres[1]);
    }
});

module.exports = router;