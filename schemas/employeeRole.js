const { sequelize, DataTypes } = require('../lib');
const { employee } = require('../schemas/employee');
const { department } = require('../schemas/department');
const { role } = require('../schemas/role');
const employeeRole = sequelize.define('employeeRole', {
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: employee,
      key: 'id',
    },
  },
  role: {
    type: DataTypes.INTEGER,
    references: {
      model: role,
      key: 'id',
    },
  },
});

employee.belongsToMany(role, { through: 'employeeRole' });

module.exports = {
  employeeRole,
};
