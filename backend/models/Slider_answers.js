module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Slider_answers', {
    slider_answer_id: {
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
        model: 'Slider_fields',
        key: 'slider_field_id'
      }
    },
    answer: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Slider_answers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Slider_answers_pkey",
        unique: true,
        fields: [
          { name: "slider_answer_id" },
        ]
      },
    ]
  });
};
