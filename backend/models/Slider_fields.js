module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Slider_fields', {
    slider_field_id: {
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
    question: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    min: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max: {
      type: DataTypes.INTEGER,
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
    tableName: 'Slider_fields',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Slider_fields_pkey",
        unique: true,
        fields: [
          { name: "slider_field_id" },
        ]
      },
    ]
  });
};
