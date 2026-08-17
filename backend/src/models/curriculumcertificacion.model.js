const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CurriculumCertificacion = sequelize.define('CurriculumCertificacion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    curriculum_id: { type: DataTypes.UUID, allowNull: false },
    nombre: { type: DataTypes.TEXT },
    institucion: { type: DataTypes.TEXT }
  }, {
    tableName: 'CURRICULUM_CERTIFICACIONES',
    timestamps: false,
    underscored: true
  });

  CurriculumCertificacion.associate = (models) => {
    CurriculumCertificacion.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id' });
  };

  return CurriculumCertificacion;
};