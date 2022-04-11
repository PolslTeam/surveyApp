const router = require('express').Router(),
    models = require('../db'),
    User = models.Users,
    Form = models.Forms,
    Text_field = models.Text_fields,
    Slider_field = models.Slider_fields,
    Singlechoice_field = models.Singlechoice_fields,
    Choice_option = models.Choice_options;

router.post('/createForm', async (req, res) => {
    try {
        const {settings, fields, user_id} = req.body;
        
        if(!settings.title)
            return res.status(400).json({message: 'Missing title'});

        if(!settings.authenticationType)
            return res.status(400).json({message: 'Missing authentication type'});
        settings.login_required = settings.authenticationType === 'logged';

        // const owner = await User.findOne({where: {user_id}}); // TODO: verify that request comes from correct user
        
        const form = await Form.create({
            user_id,
            ...settings,
        });

        for(const [form_pos, field] of Object.entries(fields)) {
            if(!field.question.length)
                return res.status(400).json({badField: form_pos, property: 'question', message: 'Empty question.'});

            const props = {
                form_id: form.form_id,
                form_pos,
                ...field
            };

            switch(field.type) {
                case 'text':
                    if(field.minLength < 0)
                        return res.status(400).json({badField: form_pos, message: 'Minimal length must be greater than 0.'});
        
                    await Text_field.create(props)
                    continue;

                case 'slider':
                    console.log(props);
                    if(isNaN(field.min) || isNaN(field.max) || field.min < 0 || field.max < 0 || field.max - field.min < 1)
                        return res.status(400).json({badField: form_pos, message: 'Provide correct min/max values'});

                    await Slider_field.create(props);
                    continue;

                case 'list':
                case 'single choice':
                    if(field.choices.length < 2)
                        return res.status(400).json({badField: form_pos, message: 'Provide at least 2 answers'});
                    if(field.choices.some(ans => !ans))
                        return res.status(400).json({badField: form_pos, message: 'Some answers are empty'});

                    const {singlechoice_field_id} = await Singlechoice_field.create({
                        is_list: field.type === 'list',
                        ...props
                    });
                    await Object.entries(field.choices).forEach(async ([option_pos, option]) => {
                        await Choice_option.create({ 
                            singleChoice_answer_id: singlechoice_field_id,
                            option_pos,
                            option
                        });
                    })
                    continue;

                default:
                    return res.status(400).json({badField: form_pos, message: `Invalid field type "${field.type}"`});
            }
        }
        res.json(form);
    } catch (e) {
        console.log(e.message);
        res.status(500).json({error: e.message});
    }
});

module.exports = router;
