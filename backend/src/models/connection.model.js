const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Connection = sequelize.define('Connection', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    sender_id: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: { model: 'USERS', key: 'id' }
    },
    receiver_id: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: { model: 'USERS', key: 'id' }
    },
    status: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'accepted', 'rejected', 'cancelled']]
      }
    }
  }, {
    tableName: 'CONNECTIONS',
    timestamps: true,
    underscored: true
  });

  Connection.associate = (models) => {
    Connection.belongsTo(models.User, { as: 'Sender', foreignKey: 'sender_id' });
    Connection.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiver_id' });
  };

  return Connection;
};
