module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Form_answers', {
    answer_id: {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    token_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Tokens',
        key: 'token_id'
      }
    },
    answer_ts: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Date.now()
    }
  }, {
    sequelize,
    tableName: 'Form_answers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Form_answers_pkey",
        unique: true,
        fields: [
          { name: "answer_id" },
        ]
      },
    ]
  });
};
