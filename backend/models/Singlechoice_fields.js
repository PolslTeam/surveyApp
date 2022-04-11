module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Singlechoice_fields', {
    singlechoice_field_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    form_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Forms',
        key: 'form_id'
      }
    },
    is_list: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    question: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    form_pos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Singlechoice_fields',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Singlechoice_fields_pkey",
        unique: true,
        fields: [
          { name: "singlechoice_field_id" },
        ]
      },
    ]
  });
};
