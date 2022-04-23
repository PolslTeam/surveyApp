module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Textfield_answers', {
    text_answer_id: {
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
    field_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Text_fields',
        key: 'text_field_id'
      }
    },
    answer: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Textfield_answers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Textfield_answers_pkey",
        unique: true,
        fields: [
          { name: "text_answer_id" },
        ]
      },
    ]
  });
};
