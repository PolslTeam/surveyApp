const router = require('express').Router();
const { models } = require('../db'),
    Forms = models.Forms,
    Survey = models.Form_answers,
    Users = models.Users
const db = require("../db");

router.get('/getUserForms', async (req, res) => {
    try {
        const user_id = req.query.id;
        const user = await Users.findOne({
            where: {
                user_id
            }
        })
        const isAdmin = user.dataValues.userType === 1;
        
        res.json({
            forms: isAdmin
                ?   await Forms.findAll({
                        where: {
                            is_archived: false
                    }})
                :   await Forms.findAll({
                        where: {
                            user_id,
                            is_archived: false
                    }})
        });
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

router.patch('/blockResumeForm', async (req, res) => {

    const transaction = await db.transaction();

    try {
        const {id, formId} = req.body.data;
        const form = await Forms.findOne({
            where: {
                form_id: formId,
                user_id: id
            }
        });
        console.log(form.is_active);
        form.is_active = !form.is_active;
        await form.save({transaction});
        await transaction.commit();
        res.json({switched: true});
    } catch (e) {
        await transaction.rollback();
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
});

router.put("/archiveForm", async(req,res) => {

    const transaction = await db.transaction();

    try{
        const {formId} = req.body;
        const form = await Forms.findOne({
            where: {
                form_id: formId
            }
        });
        form.is_archived = !form.is_archived;
        await form.save({transaction});
        await transaction.commit();
        if (form.is_archived) {
            res.json("archived");
        }
    } catch (e){
        await transaction.rollback();
        console.log(e);
        res.status(500).json({error: e.message});
    }
})

router.get('/getUsers', async (req, res) => {
    try {
        const user_id = req.query.id;
        const user = await Users.findOne({
            where: {
                user_id
            }
        })
        const isAdmin = user.dataValues.userType === 1;
        if(!isAdmin)
            return res.status(401).json({message: 'You must be admin to access all users'});

        const users = await Users.findAll();
        res.json({users});
    } catch (e) {
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
});

router.patch('/blockUnblockUser', async (req, res) => {

    const transaction = await db.transaction();

    try {
        const {user_id} = req.body.data;
        const user = await Users.findOne({
            where: {
                user_id
            }
        });
        user.is_blocked = !user.is_blocked;
        await user.save({transaction});
        await transaction.commit();
        res.json({switched: true});
    } catch (e) {
        await transaction.rollback();
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
});

module.exports = router;