module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Forms', {
    form_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    form_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Form_types',
        key: 'form_type_id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    login_required: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    answer_limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Forms',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Forms_pkey",
        unique: true,
        fields: [
          { name: "form_id" },
        ]
      },
    ]
  });
};
