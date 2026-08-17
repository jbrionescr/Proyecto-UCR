const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    user_id: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: { model: 'USERS', key: 'id' }
    },
    title: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    message: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    type: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'NOTIFICATIONS',
    timestamps: true,
    underscored: true
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Notification;
};
