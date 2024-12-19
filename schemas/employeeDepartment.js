const { sequelize, DataTypes } = require('../lib');
const { employee } = require('../schemas/employee');
const { department } = require('../schemas/department');
const employeeDepartment = sequelize.define('employeeDepartment', {
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: employee,
      key: 'id',
    },
  },
  departmentId: {
    type: DataTypes.INTEGER,
    references: {
      model: department,
      key: 'id',
    },
  },
});

employee.belongsToMany(department, { through: 'employeeDepartment' });

module.exports = {
  employeeDepartment,
};
