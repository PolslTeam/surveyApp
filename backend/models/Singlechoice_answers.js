module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Singlechoice_answers', {
    singlechoice_answer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    answer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Form_answers',
        key: 'answer_id'
      }
    },
    answer: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Choice_options',
        key: 'option_id'
      }
    },
    field_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Singlechoice_fields',
        key: 'singlechoice_field_id'
      }
    }
  }, {
    sequelize,
    tableName: 'Singlechoice_answers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Singlechoice_answers_pkey",
        unique: true,
        fields: [
          { name: "singlechoice_answer_id" },
        ]
      },
    ]
  });
};
