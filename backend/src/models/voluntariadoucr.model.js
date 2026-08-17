const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VoluntariadoUcr = sequelize.define('VoluntariadoUcr', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    tipo: { type: DataTypes.TEXT, allowNull: false },
    titulo: { type: DataTypes.TEXT, allowNull: false },
    categoria: { type: DataTypes.TEXT },
    mensaje: { type: DataTypes.TEXT },
    estado: { type: DataTypes.TEXT, defaultValue: 'PENDIENTE' },
    motivo_rechazo: { type: DataTypes.TEXT },
    revisado_por: { type: DataTypes.UUID }
  }, {
    tableName: 'VOLUNTARIADOS_UCR',
    timestamps: true,
    underscored: true
  });

  VoluntariadoUcr.associate = (models) => {
    VoluntariadoUcr.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
  };

  return VoluntariadoUcr;
};
