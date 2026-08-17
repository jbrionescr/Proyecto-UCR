const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MatchHistory = sequelize.define('MatchHistory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    match_id: { type: DataTypes.UUID, allowNull: false },
    old_status: { type: DataTypes.TEXT },
    new_status: { type: DataTypes.TEXT, allowNull: false },
    changed_by: { type: DataTypes.TEXT },
  }, {
    tableName: 'MATCH_HISTORY',
    timestamps: true,
    underscored: true
  });

  return MatchHistory;
};
