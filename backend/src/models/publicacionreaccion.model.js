const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PublicacionReaccion = sequelize.define('PublicacionReaccion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    publicacion_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'PUBLICACION_REACCIONES',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  PublicacionReaccion.associate = (models) => {
    PublicacionReaccion.belongsTo(models.Publicacion, { foreignKey: 'publicacion_id' });
    PublicacionReaccion.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return PublicacionReaccion;
};
