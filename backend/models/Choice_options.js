module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Choice_options', {
    option_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    singleChoice_answer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Singlechoice_fields',
        key: 'singlechoice_field_id'
      }
    },
    option: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    option_pos: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Choice_options',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Choice_options_pkey",
        unique: true,
        fields: [
          { name: "option_id" },
        ]
      },
    ]
  });
};
