const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CurriculumExperiencia = sequelize.define('CurriculumExperiencia', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    curriculum_id: { type: DataTypes.UUID, allowNull: false },
    tipo: { type: DataTypes.TEXT },
    titulo: { type: DataTypes.TEXT },
    organizacion: { type: DataTypes.TEXT }
  }, {
    tableName: 'CURRICULUM_EXPERIENCIA',
    timestamps: false,
    underscored: true
  });

  CurriculumExperiencia.associate = (models) => {
    CurriculumExperiencia.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id' });
  };

  return CurriculumExperiencia;
};