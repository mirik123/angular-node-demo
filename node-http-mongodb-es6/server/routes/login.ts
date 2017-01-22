
import { Utils } from '../utils';
import express = require('express');
var router = express.Router();

router.post('/', async function (req: express.Request, res: express.Response) {
    if (!req.body.username || !req.body.password) {
        res.status(500).json({ error: 'user or password are empty' });
        return;
    }

    if (req.body.username.length > 32 || req.body.password.length > 32) {
        res.status(500).json({ error: 'user or password are too long' });
        return;
    }

    try {
        var dbres = await Utils.login(req.body.username, req.body.password, req.ip);
        var validate = Utils.validate(dbres[1]);
        if (validate[0] !== 200) {
            res.status(validate[0]).json({ error: validate[1] });
        }
        else {
            res.status(validate[0]).json({ authtoken: dbres[1], permissions: validate[1][0] });
        }
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