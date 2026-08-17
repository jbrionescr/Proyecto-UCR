const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Donacion = sequelize.define('Donacion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    proyecto_estudiante_id: { type: DataTypes.UUID, allowNull: false },
    monto: { type: DataTypes.DECIMAL },
    moneda: { type: DataTypes.TEXT },
    metodo_pago: { type: DataTypes.TEXT },
    estado: { type: DataTypes.TEXT },
    confirmado_por: { type: DataTypes.UUID },
    comprobante_url: { type: DataTypes.TEXT },
    fecha_transferencia: { type: DataTypes.DATE },
    numero_referencia: { type: DataTypes.TEXT },
    validacion_estado: { type: DataTypes.TEXT },
    validacion_confianza: { type: DataTypes.INTEGER },
    validacion_detalle: { type: DataTypes.JSONB },
    validacion_at: { type: DataTypes.DATE }
  }, {
    tableName: 'DONACIONES',
    timestamps: true,
    underscored: true
  });

  Donacion.associate = (models) => {
    Donacion.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
    Donacion.belongsTo(models.Estudiante, { foreignKey: 'proyecto_estudiante_id' });
  };

  return Donacion;
};