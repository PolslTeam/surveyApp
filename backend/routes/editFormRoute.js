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

module.exports = router;
