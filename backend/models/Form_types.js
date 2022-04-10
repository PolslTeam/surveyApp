module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Form_types', {
    form_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mongo_schema: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Form_types',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Form_types_pkey",
        unique: true,
        fields: [
          { name: "form_type_id" },
        ]
      },
    ]
  });
};
