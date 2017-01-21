
import { Utils } from '../utils';
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

    Utils.login(req.body.username, req.body.password, req.ip)
        .then(dbres => {
            var validate = Utils.validate(dbres[1]);
            if (validate[0] !== 200) {
                res.status(validate[0]).json({ error: validate[1] });
            }
            else {
                res.status(validate[0]).json({ authtoken: dbres[1], permissions: validate[1][0] });
            }
        }, dbres => {
            res.status(dbres[0]).json({ error: dbres[1] });
        });
});

module.exports = router;