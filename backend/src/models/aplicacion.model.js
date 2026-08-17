const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Aplicacion = sequelize.define('Aplicacion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    posicion_id: { type: DataTypes.UUID, allowNull: false },
    estudiante_id: { type: DataTypes.UUID, allowNull: false },
    curriculum_version_id: { type: DataTypes.UUID },
    estado: { type: DataTypes.TEXT }
  }, {
    tableName: 'APLICACIONES',
    timestamps: true,
    underscored: true
  });

  Aplicacion.associate = (models) => {
    Aplicacion.belongsTo(models.Posicion, { foreignKey: 'posicion_id' });
    Aplicacion.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    Aplicacion.belongsTo(models.CurriculumVersion, { foreignKey: 'curriculum_version_id' });
  };

  return Aplicacion;
};