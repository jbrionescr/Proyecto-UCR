const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TallerInscripcion = sequelize.define('TallerInscripcion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    taller_id: { type: DataTypes.UUID, allowNull: false },
    estudiante_id: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'TALLER_INSCRIPCIONES',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  TallerInscripcion.associate = (models) => {
    TallerInscripcion.belongsTo(models.Taller, { foreignKey: 'taller_id' });
    TallerInscripcion.belongsTo(models.User, { foreignKey: 'estudiante_id' });
  };

  return TallerInscripcion;
};
