module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Singlechoice_fields', {
    singlechoice_field_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(13),
      allowNull: false,
      defaultValue: 'single choice'
    },
    form_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
