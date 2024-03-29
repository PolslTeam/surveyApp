module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Tokens', {
    token_id: {
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
    token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Tokens',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Tokens_pkey",
        unique: true,
        fields: [
          { name: "token_id" },
        ]
      },
    ]
  });
};
