const express = require("express");
const {
  department,
  employee,
  employeeDepartment,
  employeeRole,
  role,
} = require("./schemas/index");
const { sequelize } = require("./lib");
const app = express();
const port = 3000;
app.use(express.json());
// Helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { employeeId },
  });

  let departmentData;
  for (let empDep of employeeDepartments) {
    departmentData = await department.findOne({
      where: { id: empDep.departmentId },
    });
  }

  return departmentData;
}

async function getEmployeeRoles(employeeId) {
  const employeeRoles = await employeeRole.findAll({
    where: { employeeId },
    raw: false,
  });

  let roleData;
  for (let empRole of employeeRoles) {
    roleData = await role.findOne({
      where: { id: empRole.roleId },
    });
  }

  return roleData;
}

// Helper function to get employee details with associated departments and roles
async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  console.log(employee.dataValues);
  return {
    ...employeeData.dataValues,
    department,
    role,
  };
}

// Endpoint to seed database
app.get("/seed_db", async (req, res) => {
  await sequelize.sync({ force: true });

  const departments = await department.bulkCreate([
    { name: "Engineering" },
    { name: "Marketing" },
  ]);

  const roles = await role.bulkCreate([
    { title: "Software Engineer" },
    { title: "Marketing Specialist" },
    { title: "Product Manager" },
  ]);

  const employees = await employee.bulkCreate([
    { name: "Rahul Sharma", email: "rahul.sharma@example.com" },
    { name: "Priya Singh", email: "priya.singh@example.com" },
    { name: "Ankit Verma", email: "ankit.verma@example.com" },
  ]);

  // Associate employees with departments and roles using create method on junction models
  await employeeDepartment.create({
    employeeId: employees[0].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[0].id,
    roleId: roles[0].id,
  });

  await employeeDepartment.create({
    employeeId: employees[1].id,
    departmentId: departments[1].id,
  });
  await employeeRole.create({
    employeeId: employees[1].id,
    roleId: roles[1].id,
  });

  await employeeDepartment.create({
    employeeId: employees[2].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[2].id,
    roleId: roles[2].id,
  });

  return res.json({ message: "Database seeded!" });
});

async function getAllEmployees(order) {
  let query = {};
  if (order === "asc") {
    query = {
      ...query,
      order: [["name", "ASC"]],
    };
  }

  if (order === "desc") {
    query = {
      ...query,
      order: [["name", "DESC"]],
    };
  }
  const employees = await employee.findAll(query);
  return employees;
}

app.get("/employees", async (req, res) => {
  try {
    const employees = await getAllEmployees();

    if (employees.length === 0) {
      return res.status(404).json({
        message: "Employess not found",
      });
    }

    const employeesDetails = await Promise.all(
      employees.map((employee) => getEmployeeDetails(employee)),
    );

    return res.status(200).json({
      employees: employeesDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

async function getEmployee(employeeId) {
  const employeeData = await employee.findOne({ where: { id: employeeId } });
  return employeeData;
}

app.get("/employees/details/:id", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    console.log(employeeId);
    const employeeData = await getEmployee(employeeId);
    console.log(employeeData);
    if (!employeeData) {
      return res.status(404).json({
        message: "No employee found with id " + employeeId,
      });
    }
    const employeeDetail = await getEmployeeDetails(employeeData);

    return res.status(200).json({
      employee: employeeDetail,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

async function getEmployeeDepartment(departmentId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { departmentId: departmentId },
  });
  return employeeDepartments;
}

app.get("/employees/department/:departmentId", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    console.log(departmentId);
    const employeeDepartments = await getEmployeeDepartment(departmentId);
    if (employeeDepartments.length === 0) {
      return res.status(404).json({
        message: "No employee details found with departmentid " + departmentId,
      });
    }
    const employeeData = await Promise.all(
      employeeDepartments.map((empDept) => getEmployee(empDept.employeeId)),
    );

    const employeeDetails = await Promise.all(
      employeeData.map((employee) => getEmployeeDetails(employee)),
    );

    return res.status(200).json({
      employees: employeeDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

async function getEmployeeRole(roleId) {
  const employeeRoles = await employeeRole.findAll({
    where: { roleId: roleId },
  });
  return employeeRoles;
}
app.get("/employees/role/:roleId", async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    console.log(roleId);
    const employeeRoles = await getEmployeeRole(roleId);

    if (employeeRoles.length === 0) {
      return res.status(404).json({
        message: "No employee details found with roleId " + roleId,
      });
    }

    const employeeData = await Promise.all(
      employeeRoles.map((empRole) => getEmployee(empRole.employeeId)),
    );

    const employeeDetails = await Promise.all(
      employeeData.map((employee) => getEmployeeDetails(employee)),
    );

    return res.status(200).json({
      employees: employeeDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/employees/sort-by-name", async (req, res) => {
  try {
    const order = req.query.order;

    const employees = await getAllEmployees(order);
    if (employees.length === 0) {
      return res.status(404).json({
        message: "No employee details",
      });
    }

    const employeeDetails = await Promise.all(
      employees.map((employee) => getEmployeeDetails(employee)),
    );

    return res.status(200).json({
      employees: employeeDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

async function createEmployee(employeeData) {
  const newEmployee = await employee.create(employeeData);
  return newEmployee;
}
app.post("/employees/new", async (req, res) => {
  try {
    const { name, email, departmentId, roleId } = req.body;
    const newEmployeeData = {
      name,
      email,
    };
    let newEmployee = await createEmployee(newEmployeeData);
    newEmployee = {
      ...newEmployee.dataValues,
      departmentId,
      roleId,
    };

    await employeeDepartment.create({
      employeeId: newEmployee.id,
      departmentId: newEmployee.departmentId,
    });

    await employeeRole.create({
      employeeId: newEmployee.id,
      roleId: newEmployee.roleId,
    });
    // console.log(newEmployee);
    const employeeDetail = await getEmployeeDetails(newEmployee);
    // console.log(employeeDetail);
    return res.status(200).json({
      ...employeeDetail,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function updateEmployeeData(name, email, employeeId) {
  let updateValue = {};
  if (email) {
    updateValue = { ...updateValue, email };
  }

  if (name) {
    updateValue = { ...updateValue, name };
  }
  console.log(updateValue);
  if (updateValue.email || updateValue.name)
    await employee.update({ ...updateValue }, { where: { id: employeeId } });
}

async function updateEmployeeDepartment(departmentId, employeeId) {
  if (departmentId) {
    await employeeDepartment.update(
      { departmentId },
      { where: { employeeId } },
    );
  }
}

async function updateEmployeeRole(roleId, employeeId) {
  if (roleId) {
    await employeeRole.update({ roleId }, { where: { employeeId } });
  }
}

app.post("/employees/update/:id", async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    console.log(employeeId);
    const { name, email, departmentId, roleId } = req.body;

    if (departmentId) {
      const departmentExist = await department.findOne({
        where: { id: departmentId },
      });

      if (!departmentExist) {
        return res.status(400).json({ message: "Department does not exist" });
      }
    }

    if (roleId) {
      const roleExist = await role.findOne({
        where: { id: roleId },
      });

      if (!roleExist) {
        return res.status(400).json({ message: "Role does not exist" });
      }
    }

    await updateEmployeeData(name, email, employeeId);
    await updateEmployeeDepartment(departmentId, employeeId);

    await updateEmployeeRole(roleId, employeeId);

    const employee = await getEmployee(employeeId);
    console.log(employee);
    const employeeDetail = await getEmployeeDetails(employee);
    console.log(employeeDetail);
    return res.status(200).json({
      ...employeeDetail,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/employees/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const employeeExist = await employee.findOne({ where: { id } });
    if (!employeeExist) {
      return res
        .status(404)
        .json({ message: "Employee does not exist with id " + id });
    }

    await employee.destroy({ where: { id } });
    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
