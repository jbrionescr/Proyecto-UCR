const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Exalumno = sequelize.define('Exalumno', {
    user_id: { type: DataTypes.UUID, primaryKey: true, references: { model: 'USERS', key: 'id' } },
    carnet_ucr: { type: DataTypes.TEXT },
    escuela_facultad: { type: DataTypes.TEXT },
    anio_graduacion: { type: DataTypes.INTEGER },
    empresa_actual: { type: DataTypes.TEXT },
    cargo_actual: { type: DataTypes.TEXT },
    pais_ciudad: { type: DataTypes.TEXT },
    anios_experiencia: { type: DataTypes.INTEGER },
    linkedin_url: { type: DataTypes.TEXT },
    biografia: { type: DataTypes.TEXT },
    github_url: { type: DataTypes.TEXT },
    website_url: { type: DataTypes.TEXT },
    habilidades: { type: DataTypes.JSONB },
    certificaciones: { type: DataTypes.JSONB },
    experiencia_laboral: { type: DataTypes.JSONB },
    ofrece_mentoria: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_empleo: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_pasantia: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_proyecto: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_donacion_dinero: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_guest_speaking: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_volunteering: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_career_advice: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_networking:    { type: DataTypes.BOOLEAN, defaultValue: false },
    carrera:              { type: DataTypes.TEXT },
    sector:               { type: DataTypes.TEXT },
    areas_interes:        { type: DataTypes.JSONB },
    perfil_completo:      { type: DataTypes.BOOLEAN, defaultValue: false },
    visible_en_directorio: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'EXALUMNOS',
    timestamps: false,
    underscored: true
  });

  Exalumno.associate = (models) => {
    Exalumno.belongsTo(models.User, { foreignKey: 'user_id' });
    Exalumno.hasMany(models.Match, { foreignKey: 'exalumno_id' });
    Exalumno.hasMany(models.Donacion, { foreignKey: 'exalumno_id' });
    Exalumno.hasMany(models.Posicion, { foreignKey: 'exalumno_id' });
  };

  return Exalumno;
};