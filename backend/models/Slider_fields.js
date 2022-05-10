module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Slider_fields', {
    slider_field_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(6),
      allowNull: false,
      defaultValue: 'slider'
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
    min: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    max: {
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
