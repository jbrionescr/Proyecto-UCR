const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estudiante = sequelize.define('Estudiante', {
    user_id: { type: DataTypes.UUID, primaryKey: true, references: { model: 'USERS', key: 'id' } },
    carnet_ucr: { type: DataTypes.TEXT },
    carrera: { type: DataTypes.TEXT },
    escuela_facultad: { type: DataTypes.TEXT },
    sede: { type: DataTypes.TEXT },
    anio_ingreso: { type: DataTypes.INTEGER },
    nivel_academico: { type: DataTypes.TEXT },
    promedio_ponderado: { type: DataTypes.DECIMAL },
    proyecto_titulo: { type: DataTypes.TEXT },
    proyecto_tipo: { type: DataTypes.TEXT },
    busca_financiamiento: { type: DataTypes.BOOLEAN, defaultValue: false },
    busca_mentoria: { type: DataTypes.BOOLEAN, defaultValue: false },
    busca_empleo: { type: DataTypes.BOOLEAN, defaultValue: false },
    busca_pasantia: { type: DataTypes.BOOLEAN, defaultValue: false },
    proyecto_descripcion: { type: DataTypes.TEXT },
    proyecto_necesidades: { type: DataTypes.JSONB },
    proyecto_porcentaje_avance: { type: DataTypes.INTEGER },
    habilidades: { type: DataTypes.JSONB },
    area_tematica: { type: DataTypes.TEXT },
    areas_interes: { type: DataTypes.JSONB },
    nivel_beca: { type: DataTypes.TEXT },
    comprobante_beca_url: { type: DataTypes.TEXT },
    beca_socioeconomica: { type: DataTypes.BOOLEAN, defaultValue: false },
    visible_en_directorio: { type: DataTypes.BOOLEAN, defaultValue: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'ESTUDIANTES',
    timestamps: false,
    underscored: true
  });

  Estudiante.associate = (models) => {
    Estudiante.belongsTo(models.User, { foreignKey: 'user_id' });
    Estudiante.hasMany(models.Match, { foreignKey: 'estudiante_id' });
    Estudiante.hasMany(models.Donacion, { foreignKey: 'proyecto_estudiante_id' });
    Estudiante.hasOne(models.Curriculum, { foreignKey: 'estudiante_id' });
    Estudiante.hasMany(models.Aplicacion, { foreignKey: 'estudiante_id' });
  };

  return Estudiante;
};