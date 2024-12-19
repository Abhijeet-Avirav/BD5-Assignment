const { sequelize, DataTypes } = require('../lib');

const role = sequelize.define('role', {
  title: {
    type: DataTypes.STRING,
    unique: true,
  },
});

module.exports = {
  role,
};
