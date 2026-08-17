const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CurriculumVersion = sequelize.define('CurriculumVersion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    curriculum_id: { type: DataTypes.UUID, allowNull: false },
    posicion_id: { type: DataTypes.UUID },
    nombre_version: { type: DataTypes.TEXT }
  }, {
    tableName: 'CURRICULUM_VERSIONES',
    timestamps: true,
    underscored: true
  });

  CurriculumVersion.associate = (models) => {
    CurriculumVersion.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id' });
    CurriculumVersion.belongsTo(models.Posicion, { foreignKey: 'posicion_id' });
    CurriculumVersion.hasMany(models.Aplicacion, { foreignKey: 'curriculum_version_id' });
  };

  return CurriculumVersion;
};