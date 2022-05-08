const router = require('express').Router();
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken')
const { models } = require('../db'),
    Form = models.Forms,
    Survey = models.Form_answers,
    Singlechoice_answer = models.Singlechoice_answers,
    Textfield_answer = models.Textfield_answers,
    Slider_answer = models.Slider_answers,
    Text_field = models.Text_fields,
    Singlechoice_field = models.Singlechoice_fields,
    Slider_field = models.Slider_fields,
    Choice_options = models.Choice_options

router.post('/survey', async(req,res) => {
    try {
        const {formId, respondent, answers} = req.body;
        let userId;
        const form = await Form.findOne({where: {form_id: formId}});

        //validation
        if (!form || !form.is_active) {
            return res.status(404).json({message: "This survey is inactive or doesn't exist"});
        }
        if (form.end_date && form.end_date < Date.now()) {
            return res.status(400).json({message: "Survey is expired"});
        }
        if (form.login_required) {
            const verified = jwt.verify(respondent, process.env.JWT_SECRET);
            if (!verified) {
                return res.status(402).json({message: "Not authorized"});
            }
            userId = verified.id;
        } else {
            //TO-DO Anon validation
        }
        if (form.answer_limit) {
            const answerCount = await Survey.count({where: {form_id: formId}});
            if (answerCount >= form.answer_limit)
                return res.status(400).json({message: "Answer limit reached"});
        }

        const newSurvey = await Survey.create({
            form_id: formId,
            user_id: userId ? userId : null,
            token_id: !userId ? respondent : null
        });

        for (const answer of answers) {
            const newRecord = {
                answer_id: newSurvey.answer_id,
                field_id: answer.field_id,
                answer: answer.answer
            }
            if (answer.type === "text") await Textfield_answer.create(newRecord)
            if (answer.type === "slider") await Slider_answer.create(newRecord)
            if (answer.type === "choice") await Singlechoice_answer.create(newRecord)
        }

        res.json(newSurvey);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.get('/survey/:formId/type', async(req,res) => {
    try {
        const { formId } = req.params;
        const form = await Form.findOne( { where: { form_id: formId }});
        if (!form || !form.is_active) {
            return res.status(404).json({message: "This survey is inactive or doesn't exist"});
        }

        return res.status(200).json(form.login_required)

    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.get('/survey/:formId/myAnswers', async(req,res) => {
    try {
        const { formId: form_id } = req.params;
        const { respondent } = req.query;
        let user_id;
        const form = await Form.findOne({where: {form_id}});
  
        if (!form) {
            return res.status(404).json({message: "This survey doesn't exist"});
        }
  
        if (form.login_required) {
            const verified = jwt.verify(respondent, process.env.JWT_SECRET);
            if (!verified) {
                return res.status(403).json({message: "Not authorized"});
            }
            user_id = verified.id;
        } else {
            //TO-DO Anon validation
        }
  
        const filledSurvey = await Survey.findOne({
            where: { form_id, user_id }
        });
  
        if(!filledSurvey) {
            // return res.status(404).json({message: "You never filled this survey"});
            return res.status(200).json({});
        }

        const query = {where: {answer_id: filledSurvey.dataValues.answer_id}};
        const answers = [
            ...await Textfield_answer.findAll(query),
            ...await Slider_answer.findAll(query),
            ...await Singlechoice_answer.findAll(query),
        ];
        
        return res.status(200).json({answers});
  
    } catch (e) {
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
  });

router.get('/survey/:formId', async(req,res) => {
    try {
        const { formId } = req.params;
        const anonToken = req.query.anonToken;
        const userToken = req.header("x-auth-token");
        let userId;
        const formInstance = await Form.findOne({
            where: {
                form_id: formId
            },
            include: [
                {
                    model: Text_field,
                    as: 'Text_fields'
                },
                {
                    model: Slider_field,
                    as: 'Slider_fields'
                },
                {
                    model: Singlechoice_field,
                    as: 'Singlechoice_fields'
                }
            ]
        });
        const form = formInstance.toJSON();

        if (form && form.login_required) {
            if (!userToken || userToken === "null") {
                return res.status(402).json({message: "Login is required"});
            }
            const verified = jwt.verify(userToken, process.env.JWT_SECRET);
            userId = verified.id;
            if (!verified) return res.status(402).json({message: "Not authorized"});
        } else if (anonToken) {
            //TO-DO Anon validation
        } else {
            return res.status(403).json({message: "Token is required to fill this survey!"});
        }

        const filledSurvey = await Survey.findOne({
            where: {
                form_id: formId,
                [Op.or]: [
                    {user_id: userId},
                    {token_id: userId}
                ]
            }
        });

        if (!filledSurvey && !form.is_active) {
            return res.status(404).json({message: "This survey is inactive or doesn't exist"});
        }

        if (!filledSurvey && form.start_date && form.start_date > Date.now()) {
            return res.status(400).json({message: "Survey is not active yet"});
        }
        if (!filledSurvey && form.end_date && form.end_date < Date.now()) {
            return res.status(400).json({message: "Survey is expired"});
        }
        if (!filledSurvey && form.answer_limit) {
            const answerCount = await Survey.count({ where: { form_id: formId }});
            if (answerCount >= form.answer_limit)
                return res.status(400).json({message: "Answer limit reached"});
        }

        form.Singlechoice_fields = await Promise.all(form.Singlechoice_fields.map(async field => {
            return {
                ...field,
                options: await Choice_options.findAll({where: {singlechoice_field_id: field.singlechoice_field_id}}),
            }
        }));

        form.fields = form.Singlechoice_fields.concat(form.Text_fields, form.Slider_fields);
        delete form.Singlechoice_fields;
        delete form.Text_fields;
        delete form.Slider_fields;

        form.fields = form.fields.sort((a, b) => (a.form_pos > b.form_pos) ? 1 : -1);

        res.json(form);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;