const {models} = require("../db");
const db = require("../db");
const router = require('express').Router(),
  Form = models.Forms,
  Text_field = models.Text_fields,
  Singlechoice_field = models.Singlechoice_fields,
  Slider_field = models.Slider_fields,
  Choice_options = models.Choice_options

router.get("/getForm", async (req, res) =>{
  try{
    const {user_id, form_id} = req.query;
    // const owner = await User.findOne({_id: id});
    const formInstance = await Form.findOne({
      where: {
        form_id,
        user_id
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
    console.log(e);
    res.status(500).json({error: e.message});
  }
});

router.put("/editForm", async(req,res) => {
  const transaction = await db.transaction();

  const res400 = async (form_pos, message) => {
    await transaction.rollback();
    return res.status(400).json({form_pos, message});
  }

  try {
    const {settings, fields, user_id} = req.body;

    const form = await Form.findOne({
      where: {
        form_id,
        user_id
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

    if(!settings.title)
      return res.status(400).json({message: 'Missing title'});

    if(!fields.length)
      return res.status(400).json({message: 'Add at least 1 field'});

    if(!settings.authenticationType)
      return res.status(400).json({message: 'Missing authentication type'});
    settings.login_required = settings.authenticationType === 'logged';

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

          if (!field.text_field_id) {
            await Text_field.create(props, {transaction})
          } else {
            const text = await Text_field.findOne({where: {text_field_id: field.text_field_id}})
            await text.update({
              question: field.question,
              min_length: field.min_length,
              form_pos,
              required: field.required
            })
            await text.save();
          }
          continue;
        case 'slider':
          if(isNaN(field.min) || isNaN(field.max) || field.min < 0 || field.max < 0 || field.max - field.min < 1)
            return res400(form_pos, 'Provide correct min/max values');
          if (!field.text_field_id) {
            await Slider_field.create(props, {transaction});
          } else {
            const slider = await Slider_field.findOne({where: {slider_field_id: field.slider_field_id}})
            await slider.update({
              question: field.question,
              min: field.min,
              max: field.max,
              form_pos,
              required: field.required
            })
            await slider.save();
          }
          continue;

        case 'list':
        case 'single choice':
          if(field.choices.length < 2)
            return res400(form_pos, 'Provide at least 2 answers');
          if(field.choices.some(ans => !ans))
            return res400(form_pos, 'Some answers are empty');
          if (!field.singlechoice_field_id) {
            const {singlechoice_field_id} = await Singlechoice_field.create({
              is_list: field.type === 'list',
              ...props
            }, {transaction});
            for (const [option_pos, option] of Object.entries(field.choices))
              await Choice_option.create({
                singlechoice_field_id,
                option_pos,
                option
              }, {transaction});
          } else {
            const singlechoice = await Singlechoice_field.findOne({
              singlechoice_field_id: field.singlechoice_field_id
            });
            await singlechoice.update({
              is_list: field.type === 'list',
              question: field.question,
              form_pos: form_pos,
              required: field.required,
            })
            await singlechoice.save()
            for (const option of Object.entries(field.choices))
              if (!option.option_id) {
                await Choice_option.create({
                  singlechoice_field_id: field.singlechoice_field_id,
                  option_pos: option.option_pos,
                  option: option.option
                }, {transaction});
              } else {
                const foundOption = await Choice_options.findOne({
                  where:{
                    singlechoice_field_id: field.singlechoice_field_id,
                    option_id: field.option_id
                  }
                })
                await foundOption.update({
                  option: option.option,
                  option_pos: option.option_pos
                })
                await foundOption.save()
              }
          }
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
})

module.exports = router;
