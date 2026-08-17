const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exalumno_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    estudiante_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tipo_apoyo: {
      type: DataTypes.TEXT,
    },
    score_match: {
      type: DataTypes.INTEGER,
    },
    estado: {
      type: DataTypes.ENUM('SUGERIDO', 'CONTACTADO', 'ACTIVO', 'CERRADO'),
      defaultValue: 'SUGERIDO',
      allowNull: false,
    },
    resultado: {
      type: DataTypes.TEXT,
    },
    initiated_by: {
      type: DataTypes.TEXT,
      defaultValue: 'sistema',
    },
    rechazado_por_estudiante: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'MATCHES',
    timestamps: true,
    underscored: true,
  });

  Match.associate = (models) => {
    Match.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
    Match.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    Match.hasMany(models.Message, { foreignKey: 'match_id', as: 'messages' });
  };

  return Match;
};
