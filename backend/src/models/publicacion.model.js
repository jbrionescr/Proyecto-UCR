const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Publicacion = sequelize.define('Publicacion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    autor_id: { type: DataTypes.UUID, allowNull: false },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    imagen_url: { type: DataTypes.TEXT }
  }, {
    tableName: 'PUBLICACIONES',
    timestamps: true,
    underscored: true
  });

  Publicacion.associate = (models) => {
    Publicacion.belongsTo(models.User, { foreignKey: 'autor_id' });
    Publicacion.hasMany(models.PublicacionReaccion, { foreignKey: 'publicacion_id' });
    Publicacion.hasMany(models.PublicacionComentario, { foreignKey: 'publicacion_id' });
  };

  return Publicacion;
};
