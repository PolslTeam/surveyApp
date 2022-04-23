const router = require('express').Router(),
    db = require('../db'),
    Form = db.models.Forms,
    Text_field = db.models.Text_fields,
    Slider_field = db.models.Slider_fields,
    Singlechoice_field = db.models.Singlechoice_fields,
    Choice_option = db.models.Choice_options;

router.post('/createForm', async (req, res) => {
    const transaction = await db.transaction();

    const res400 = async (form_pos, message) => {
        await transaction.rollback();
        return res.status(400).json({form_pos, message});
    }

    try {
        const {settings, fields, user_id} = req.body;
        
        if(!settings.title)
            return res.status(400).json({message: 'Missing title'});

        if(!fields.length)
            return res.status(400).json({message: 'Add at least 1 field'});

        if(!settings.authenticationType)
            return res.status(400).json({message: 'Missing authentication type'});
        settings.login_required = settings.authenticationType === 'logged';

        // const owner = await User.findOne({where: {user_id}}); // TODO: verify that request comes from correct user

        const form = await Form.create({
            user_id,
            ...settings,
        }, { transaction });

        for(const [form_pos, field] of Object.entries(fields)) {
            if(!field.question.length)
                return res400(form_pos, 'Empty question.');

            const props = {
                form_id: form.form_id,
                form_pos,
                ...field
            };

            switch(field.type) {
                case 'text':
                    if(field.minLength < 0)
                        return res400(form_pos, 'Minimal length must be greater than 0');
        
                    await Text_field.create(props, { transaction })
                    continue;

                case 'slider':
                    if(isNaN(field.min) || isNaN(field.max) || field.min < 0 || field.max < 0 || field.max - field.min < 1)
                        return res400(form_pos, 'Provide correct min/max values');

                    await Slider_field.create(props, { transaction });
                    continue;

                case 'list':
                case 'single choice':
                    if(field.choices.length < 2)
                        return res400(form_pos, 'Provide at least 2 answers');
                    if(field.choices.some(ans => !ans))
                        return res400(form_pos, 'Some answers are empty');

                    const {singlechoice_field_id} = await Singlechoice_field.create({
                        is_list: field.type === 'list',
                        ...props
                    }, { transaction });
                    await Object.entries(field.choices).forEach(async ([option_pos, option]) => {
                        await Choice_option.create({ 
                            singlechoice_field_id: singlechoice_field_id,
                            option_pos,
                            option
                        }, { transaction });
                    })
                    continue;

                default:
                    return res400(form_pos, `Invalid field type "${field.type}"`);
            }
        }
        await transaction.commit();
        res.json(form);
    } catch (e) {
        await transaction.rollback();
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
});

module.exports = router;
