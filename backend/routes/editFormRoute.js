const {models} = require("../db");
const db = require("../db");
const router = require('express').Router(),
  Form = models.Forms,
  Text_field = models.Text_fields,
  Singlechoice_field = models.Singlechoice_fields,
  Slider_field = models.Slider_fields,
  Choice_options = models.Choice_options,
  Tokens = models.Tokens

router.get("/getForm", async (req, res) =>{
  try{
    const {user_id, form_id} = req.query;
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
      const options = await Choice_options.findAll({where: {singlechoice_field_id: field.singlechoice_field_id}});

      return {
        ...field,
        choices: options.sort((a, b) => (a.form_pos > b.form_pos) ? -1 : 1).map(item => { return item.option }),
        choices_id: options.sort((a, b) => (a.form_pos > b.form_pos) ? -1 : 1).map(item => { return item.option_id })
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
    const {settings, fields, form_id, fieldToRem} = req.body;

    for (const item of fieldToRem){
      if (item.type === 'slider') {
        const found = await Slider_field.findOne({where: {slider_field_id: item.id}});
        await found.destroy({transaction});
      } else if (item.type === 'text') {
        const found = await Text_field.findOne({where: {text_field_id: item.id}});
        await found.destroy({transaction});
      } else if (item.type === 'single choice' || item.type === 'list') {
        const found = await Singlechoice_field.findOne({where: {singlechoice_field_id: item.id}})
        const options = await Choice_options.findAll({where: {singlechoice_field_id: item.id}});
        for (const option of options) {
          await option.destroy({transaction});
        }
        await found.destroy();
      } else if (item.type === 'option') {
        const found = await Choice_options.findOne({where: {option_id: item.id}});
        await found.destroy({transaction});
      }
    }

    const form = await Form.findOne({
      where: {
        form_id
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

    if (settings.authenticationType === "logged") {
      const tokens = await Tokens.findAll({where: {form_id: form_id}});
      for (const token of tokens) {
        await token.destroy({transaction});
      }
    }

    if(!settings.title)
    return res.status(400).json({message: 'Missing title'});

    if(!fields.length)
      return res.status(400).json({message: 'Add at least 1 field'});

    if(!settings.authenticationType)
      return res.status(400).json({message: 'Missing authentication type'});
    settings.login_required = settings.authenticationType === 'logged';

    await form.update({
      title: settings.title,
      description: settings.description,
      login_required: settings.authenticationType === "logged",
      start_date: settings.start_date,
      end_date: settings.end_date,
      answer_limit: settings.answer_limit
    }, {transaction});
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
            const text = await Text_field.findOne({where: {text_field_id: field.text_field_id, form_id: form_id}})
            await text.update({
              question: field.question,
              min_length: field.min_length,
              form_pos,
              required: field.required
            }, {transaction})
          }
          continue;
        case 'slider':
          if(isNaN(field.min) || isNaN(field.max) || field.min < 0 || field.max < 0 || field.max - field.min < 1)
            return res400(form_pos, 'Provide correct min/max values');
          if (!field.slider_field_id) {
            await Slider_field.create(props, {transaction});
          } else {
            const slider = await Slider_field.findOne({where: {slider_field_id: field.slider_field_id, form_id: form_id}})
            await slider.update({
              question: field.question,
              min: field.min,
              max: field.max,
              form_pos,
              required: field.required
            }, {transaction})
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
            for (const [option_pos, option] of Object.entries(field.choices)){
            await Choice_options.create({
                singlechoice_field_id,
                option_pos,
                option
              }, {transaction});
            }
          } else {
            const singlechoice = await Singlechoice_field.findOne( {where :{
              singlechoice_field_id: field.singlechoice_field_id,
              form_id: form_id
            }});
            await singlechoice.update({
              is_list: field.type === 'list',
              question: field.question,
              form_pos: form_pos,
              required: field.required,
            }, {transaction})
            let n = 0;
            for (const [index, choices] of Object.entries(field.choices)) {
              if (!field.choices_id[index]) {
                await Choice_options.create({
                  singlechoice_field_id: field.singlechoice_field_id,
                  option_pos: n,
                  option: choices
                }, {transaction});
              } else {
                const foundOption = await Choice_options.findOne({
                  where: {
                    singlechoice_field_id: field.singlechoice_field_id,
                    option_id: field.choices_id[index]
                  }
                })
                await foundOption.update({
                  option: choices,
                  option_pos: n
                }, {transaction})
                n++
              }
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
