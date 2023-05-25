const express = require('express');
const mysql = require('mysql2');
const consoleTable = require('console.table');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        port: 3306,
        user: 'admin',
        password: 'jener8er',
        database: 'store_db',
    },
);

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');
    startApp();
});

function startApp() {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Exit'
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case 'View All Departments':
                    viewDepartments();
                    break;
                case 'View All Roles':
                    viewRoles();
                    break;
                case 'View All Employees':
                    viewEmployees();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
                case 'Exit':
                    db.end();
                    console.log('Disconnected from the database.');
                    break;
                default:
                    console.log('Invalid option. Please try again.');
                    startApp();
            }
        });
}

function viewDepartments() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        startApp();
    });
}

function viewRoles() {
    const query = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id
    `;
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startApp();
    })
}

function viewEmployees() {
    const query = `
        SELECT
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title,
            department.name AS department,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        INNER JOIN role ON employee.role_id = role.id
        INNER JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id
    `;
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startApp();
    })
}

function addDepartment() {
    inquirer
        .prompt({
            name: 'name',
            type: 'input',
            message: 'Enter the name of the department you would like to add:',
        })
        .then((answer) => {
            const query = 'INSERT INTO department SET ?';
            db.query(query, { name: answer.name }, (err) => {
                if (err) throw (err);
                console.log('Department added successfully!');
                startApp();
            });
        });
}

function addRole() {
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

    inquirer
        .prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Enter the title of the role:',
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter the salary for the role:',
            },
            {
                name: 'department',
                type: 'list',
                message: 'Select the department for the role:',
                choices: departments.map((department) => department.name),
            },
        ])
        .then((answers) => {
            const selectedDepartment = departments.find(
                (department) => department.name === answers.department
            );

            const query = 'INSERT INTO role SET ?';
            db.query(
                query,
                {
                    title: answers.title,
                    salary: answers.salary,
                    department_id: selectedDepartment.id,
                },
                (err) => {
                    if (err) throw err;
                    console.log('Role added successfully!');
                    startApp();
                }
            );
        });
    });
}

function addEmployee() {
    db.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;

        db.query('SELECT * FROM employee', (err, employees) => {
            if (err) throw err;

        inquirer
            .prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: "Enter the employee's first name:",
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: "Enter the employee's last name:",
                },
                {
                    name: 'role',
                    type: 'list',
                    message: "Select the employee's role:",
                    choices: roles.map((role) => role.title),
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: "Select the employee's manager:",
                    choices: [
                        'None',
                        ...employees.map(
                            (employee) =>
                        `${employee.first_name} ${employee.last_name}`
                        ),
                    ],
                },
            ])
            .then((answers) => {
                const selectedRole = roles.find((role) => role.title === answers.role);
                const selectedManager = employees.find(
                    (employee) =>
                        `${employee.first_name} ${employee.last_name}` === answers.manager
                );

                const query = 'INSERT INTO employee SET ?';
                db.query(
                    query,
                    {
                        first_name: answers.firstName,
                        last_name: answers.lastName,
                        role_id: selectedRole.id,
                        manager_id: selectedManager ? selectedManager.id : null,
                    },
                    (err) => {
                        if (err) throw err;
                        console.log('Employee added successfully!');
                        startApp();
                    }
                );
            });
        });
    });
}

function updateEmployeeRole() {
    db.query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;

        db.query('SELECT * FROM role', (err, roles) => {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        name: 'employee',
                        type: 'list',
                        message: 'Select the employee to update:',
                        choices: employees.map(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        name: 'role',
                        type: 'list',
                        message: 'Select the new role for the employee:',
                        choices: roles.map((role) => role.title),
                    },
                ])
                .then((answers) => {
                    const selectedEmployee = employees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` === answers.employee
                    );
            const selectedRole = roles.find((role) => role.title === answers.role);

            const query = 'UPDATE employee SET ? WHERE ?';
                db.query(
                    query,
                    [
                        { role_id: selectedRole.id },
                        { id: selectedEmployee.id },
                    ],
                    (err) => {
                        if (err) throw err;
                        console.log('Employee role updated successfully!');
                        startApp();
                    }
                );
            });
        });
    });
}