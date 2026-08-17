const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Curriculum = sequelize.define('Curriculum', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    estudiante_id: { type: DataTypes.UUID, allowNull: false },
    habilidades_tecnicas: { type: DataTypes.JSONB },
    idiomas: { type: DataTypes.JSONB }
  }, {
    tableName: 'CURRICULUM',
    timestamps: true,
    underscored: true
  });

  Curriculum.associate = (models) => {
    Curriculum.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    Curriculum.hasMany(models.CurriculumExperiencia, { foreignKey: 'curriculum_id' });
    Curriculum.hasMany(models.CurriculumCertificacion, { foreignKey: 'curriculum_id' });
    Curriculum.hasMany(models.CurriculumVersion, { foreignKey: 'curriculum_id' });
  };

  return Curriculum;
};