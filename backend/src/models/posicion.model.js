const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Posicion = sequelize.define('Posicion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    tipo: { type: DataTypes.TEXT },
    titulo: { type: DataTypes.TEXT },
    modalidad: { type: DataTypes.TEXT },
    jornada: { type: DataTypes.TEXT },
    empresa: { type: DataTypes.TEXT },
    fecha_limite: { type: DataTypes.DATE },
    estado: { type: DataTypes.TEXT }
  }, {
    tableName: 'POSICIONES',
    timestamps: true,
    underscored: true
  });

  Posicion.associate = (models) => {
    Posicion.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
    Posicion.hasMany(models.Aplicacion, { foreignKey: 'posicion_id' });
    Posicion.hasMany(models.CurriculumVersion, { foreignKey: 'posicion_id' });
  };

  return Posicion;
};