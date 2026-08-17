const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PublicacionComentario = sequelize.define('PublicacionComentario', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    publicacion_id: { type: DataTypes.UUID, allowNull: false },
    autor_id: { type: DataTypes.UUID, allowNull: false },
    contenido: { type: DataTypes.TEXT, allowNull: false }
  }, {
    tableName: 'PUBLICACION_COMENTARIOS',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  PublicacionComentario.associate = (models) => {
    PublicacionComentario.belongsTo(models.Publicacion, { foreignKey: 'publicacion_id' });
    PublicacionComentario.belongsTo(models.User, { foreignKey: 'autor_id' });
  };

  return PublicacionComentario;
};
