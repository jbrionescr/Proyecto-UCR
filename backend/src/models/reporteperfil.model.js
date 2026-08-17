const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReportePerfil = sequelize.define('ReportePerfil', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reportado_por: { type: DataTypes.UUID, allowNull: false },
    perfil_reportado: { type: DataTypes.UUID, allowNull: false },
    motivo: { type: DataTypes.TEXT },
    resuelto: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'REPORTES_PERFIL',
    timestamps: true,
    underscored: true
  });

  ReportePerfil.associate = (models) => {
    ReportePerfil.belongsTo(models.User, { foreignKey: 'reportado_por', as: 'Reporter' });
    ReportePerfil.belongsTo(models.User, { foreignKey: 'perfil_reportado', as: 'Reported' });
  };

  return ReportePerfil;
};