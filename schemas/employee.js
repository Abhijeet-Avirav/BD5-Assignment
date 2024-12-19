const { DataTypes, sequelize } = require('../lib');

const employee = sequelize.define('employee', {
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
});

module.exports = {
  employee,
};
