const router = require('express').Router();
db = require('../db')
  Tokens = db.models.Tokens;

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
    const transaction = await db.transaction();
    try {
        const {formId, numberOfTokens} = req.body;
           if (Number(numberOfTokens) < 100){
            await Tokens.bulkCreate(new Array(numberOfTokens).fill({form_id: formId}))
            await transaction.commit()
            return res
              .status(200)
              .json(numberOfTokens > 1 ? "Token's generated successfully" : "Token generated successfully");
        } else {
            return res
              .status(400)
              .json({message: `You can't generate more than 100 tokens`});
        }
    } catch (e) {
        await transaction.rollback()
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
})

module.exports = router;