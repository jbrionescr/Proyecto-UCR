const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Taller = sequelize.define('Taller', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    titulo: { type: DataTypes.TEXT, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    fecha_hora: { type: DataTypes.DATE },
    cupos_totales: { type: DataTypes.INTEGER, defaultValue: 0 },
    modalidad: { type: DataTypes.TEXT, defaultValue: 'ONLINE' },
    estado: { type: DataTypes.TEXT, defaultValue: 'PENDIENTE' },
    motivo_rechazo: { type: DataTypes.TEXT },
    revisado_por: { type: DataTypes.UUID }
  }, {
    tableName: 'TALLERES',
    timestamps: true,
    underscored: true
  });

  Taller.associate = (models) => {
    Taller.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
    Taller.hasMany(models.TallerInscripcion, { foreignKey: 'taller_id' });
  };

  return Taller;
};
