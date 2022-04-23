var DataTypes = require("sequelize").DataTypes;
var _Choice_options = require("./Choice_options");
var _Form_answers = require("./Form_answers");
var _Form_types = require("./Form_types");
var _Forms = require("./Forms");
var _Singlechoice_answers = require("./Singlechoice_answers");
var _Singlechoice_fields = require("./Singlechoice_fields");
var _Slider_answers = require("./Slider_answers");
var _Slider_fields = require("./Slider_fields");
var _Text_fields = require("./Text_fields");
var _Textfield_answers = require("./Textfield_answers");
var _Tokens = require("./Tokens");
var _Users = require("./Users");

function initModels(sequelize) {
  var Choice_options = _Choice_options(sequelize, DataTypes);
  var Form_answers = _Form_answers(sequelize, DataTypes);
  var Form_types = _Form_types(sequelize, DataTypes);
  var Forms = _Forms(sequelize, DataTypes);
  var Singlechoice_answers = _Singlechoice_answers(sequelize, DataTypes);
  var Singlechoice_fields = _Singlechoice_fields(sequelize, DataTypes);
  var Slider_answers = _Slider_answers(sequelize, DataTypes);
  var Slider_fields = _Slider_fields(sequelize, DataTypes);
  var Text_fields = _Text_fields(sequelize, DataTypes);
  var Textfield_answers = _Textfield_answers(sequelize, DataTypes);
  var Tokens = _Tokens(sequelize, DataTypes);
  var Users = _Users(sequelize, DataTypes);

  Singlechoice_answers.belongsTo(Choice_options, { as: "answer_Choice_option", foreignKey: "answer"});
  Choice_options.hasMany(Singlechoice_answers, { as: "Singlechoice_answers", foreignKey: "answer"});
  Singlechoice_answers.belongsTo(Form_answers, { as: "choice_answer", foreignKey: "answer_id"});
  Form_answers.hasMany(Singlechoice_answers, { as: "Singlechoice_answers", foreignKey: "answer_id"});
  Slider_answers.belongsTo(Form_answers, { as: "slider_answer", foreignKey: "answer_id"});
  Form_answers.hasMany(Slider_answers, { as: "Slider_answers", foreignKey: "answer_id"});
  Textfield_answers.belongsTo(Form_answers, { as: "text_answer", foreignKey: "answer_id"});
  Form_answers.hasMany(Textfield_answers, { as: "Textfield_answers", foreignKey: "answer_id"});
  Forms.belongsTo(Form_types, { as: "form_type", foreignKey: "form_type_id"});
  Form_types.hasMany(Forms, { as: "Forms", foreignKey: "form_type_id"});
  Form_answers.belongsTo(Forms, { as: "form", foreignKey: "form_id"});
  Forms.hasMany(Form_answers, { as: "Form_answers", foreignKey: "form_id"});
  Singlechoice_fields.belongsTo(Forms, { as: "form", foreignKey: "form_id"});
  Forms.hasMany(Singlechoice_fields, { as: "Singlechoice_fields", foreignKey: "form_id"});
  Slider_fields.belongsTo(Forms, { as: "form", foreignKey: "form_id"});
  Forms.hasMany(Slider_fields, { as: "Slider_fields", foreignKey: "form_id"});
  Text_fields.belongsTo(Forms, { as: "form", foreignKey: "form_id"});
  Forms.hasMany(Text_fields, { as: "Text_fields", foreignKey: "form_id"});
  Tokens.belongsTo(Forms, { as: "form", foreignKey: "form_id"});
  Forms.hasMany(Tokens, { as: "Tokens", foreignKey: "form_id"});
  Choice_options.belongsTo(Singlechoice_fields, { as: "singlechoice_field", foreignKey: "singlechoice_field_id"});
  Singlechoice_fields.hasMany(Choice_options, { as: "Choice_options", foreignKey: "singlechoice_field_id"});
  Singlechoice_answers.belongsTo(Singlechoice_fields, { as: "field", foreignKey: "field_id"});
  Singlechoice_fields.hasMany(Singlechoice_answers, { as: "Singlechoice_answers", foreignKey: "field_id"});
  Slider_answers.belongsTo(Slider_fields, { as: "field", foreignKey: "field_id"});
  Slider_fields.hasMany(Slider_answers, { as: "Slider_answers", foreignKey: "field_id"});
  Textfield_answers.belongsTo(Text_fields, { as: "field", foreignKey: "field_id"});
  Text_fields.hasMany(Textfield_answers, { as: "Textfield_answers", foreignKey: "field_id"});
  Form_answers.belongsTo(Tokens, { as: "token", foreignKey: "token_id"});
  Tokens.hasMany(Form_answers, { as: "Form_answers", foreignKey: "token_id"});
  Form_answers.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Form_answers, { as: "Form_answers", foreignKey: "user_id"});
  Forms.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Forms, { as: "Forms", foreignKey: "user_id"});

  return {
    Choice_options,
    Form_answers,
    Form_types,
    Forms,
    Singlechoice_answers,
    Singlechoice_fields,
    Slider_answers,
    Slider_fields,
    Text_fields,
    Textfield_answers,
    Tokens,
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
