const router = require('express').Router();
const { models } = require('../db'),
    Forms = models.Forms,
    Survey = models.Form_answers

router.get('/getUserForms', async (req, res) => {
    try {
        const user_id = req.query.id;
        const forms = await Forms.findAll({
            where: {
                user_id
            }
        });
        res.json({forms});
    } catch (e) {
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
});

router.get('/getFilledForms', async (req, res) => {
    try {
        const user_id = req.query.id;
        const forms = await Survey.findAll({
            where: {
                user_id
            },
            include: {
                model: Forms,
                as: 'form'
            }
        });
        res.json({forms});
    } catch (e) {
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
});

module.exports = router;