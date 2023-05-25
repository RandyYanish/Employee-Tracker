INSERT INTO department (name) VALUES
    ('Sales'),
    ('Marketing'),
    ('Finance');

INSERT INTO role (title, salary, department_id) VALUES
    ('Sales Manager', 80000, 1),
    ('Sales Representative', 50000, 1),
    ('Marketing Manager', 70000, 2),
    ('Marketing Coordinator', 40000, 2),
    ('Financial Analyst', 60000, 3),
    ('Accountant', 50000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Mike', 'Johnson', 2, 1),
    ('Emily', 'Williams', 3, 1),
    ('David', 'Brown', 4, 3),
    ('Sarah', 'Davis', 5, 3),
    ('Michael', 'Miller', 6, 5),
    ('Jennifer', 'Wilson', 6, 5),
    ('Jessica', 'Taylor', 6, 5),
    ('Christopher', 'Anderson', 6, 5);