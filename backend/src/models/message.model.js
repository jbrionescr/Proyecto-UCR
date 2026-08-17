const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    match_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'MATCHES', key: 'id' },
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'USERS', key: 'id' },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'MESSAGES',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Match, { foreignKey: 'match_id' });
    Message.belongsTo(models.User,  { foreignKey: 'sender_id', as: 'sender' });
  };

  return Message;
};
