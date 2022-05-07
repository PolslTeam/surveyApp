const router = require('express').Router();
const { models } = require('../db'),
    Forms = models.Forms,
    Survey = models.Form_answers

router.get('/getUserForms', async (req, res) => {
    try {
        const user_id = "502f2895-352d-4466-88c5-acbd31e2cfe6";//req.query.id;
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
        const user_id = "defe5e53-c72e-45e3-9205-35dda7f57cde";//req.query.id;
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