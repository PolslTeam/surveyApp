const router = require('express').Router();
const { models } = require('../db'),
    Tokens = models.Tokens

router.get("/getTokens", async (req, res) => {
    try {
        const form_id = req.query.formId;
        const tokenValueList = [];
        const tokens = await Tokens.findAll({
            where: {
                form_id
            }
        });
        tokens.forEach(val =>{
            tokenValueList.push(val.token);
        })
        res.json(tokenValueList);
    } catch (e) {
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
})

module.exports = router;