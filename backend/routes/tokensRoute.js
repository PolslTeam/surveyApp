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

router.post("/generateTokens", async (req,res) => {
    try {
        const {formId, numberOfTokens} = req.body;
        const tokens = await Tokens.findAll({
            where: {
                form_id: formId
            }
        });
        if (numberOfTokens * 1 <= 10000) {
            let uniqueTokens = [];
            if (tokens) {
                tokens.forEach(val => {
                    uniqueTokens.push(val.token)
                })
            }
            const existingTokens = new Set(uniqueTokens)
            const eT = existingTokens.size + (numberOfTokens * 1)
            for (let i = 0; uniqueTokens.length < eT; i++) {
                const token = (Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)).substring(0,16);
                uniqueTokens.push(token);
                uniqueTokens = uniqueTokens.filter((x, i, a) => a.indexOf(x) === i)
            }
            uniqueTokens = uniqueTokens.filter( el => !existingTokens.has( el ))
            for (const item of uniqueTokens){
                const token = {
                    form_id: formId,
                    token: item,
                    used: false
                };
                await Tokens.create(token)
            }
            return res
              .status(200)
              .json(uniqueTokens);
        } else {
            return res
              .status(400)
              .json({message: `You can't generate more than 10000 tokens`});
        }
    } catch (e) {
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
})

module.exports = router;