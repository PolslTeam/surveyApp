module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Text_fields', {
    text_field_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    form_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Forms',
        key: 'form_id'
      }
    },
    question: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    min_length: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    max_length: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    form_pos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Text_fields',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Text_fields_pkey",
        unique: true,
        fields: [
          { name: "text_field_id" },
        ]
      },
    ]
  });
};
