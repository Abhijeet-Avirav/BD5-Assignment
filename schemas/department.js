const { DataTypes, sequelize } = require('../lib');

const department = sequelize.define('department', {
  name: {
    type: DataTypes.STRING,
    unique: true,
  },
});

module.exports = {
  department,
};
