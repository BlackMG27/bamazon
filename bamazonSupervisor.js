let inquire = require('inquirer');
let mysql = require('mysql');
const {
    Table
} = require('console-table-printer');

let connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err)
        throw err;
    console.log("connected as id " + connection.threadId + "\n");
    askSupervisor();
});

function askSupervisor() {
    //ask the user what they would like to do
    inquire.prompt({
        name: 'choice',
        message: 'Hello! What would you like to do?',
        choices: ['View Product Sales by Department', 'Create New Department'],
        type: 'list'
    }).then(function (ans) {
        console.log(`\n\n ----------------------------------------- \n\n`);
        console.log(ans.choice);
        switch (ans.choice) {
            case 'View Product Sales by Department':
                viewProducts();
                break;
            case 'Create New Department':
                createDepartment();
                break;
        }
    })
}

function viewProducts() {
    //set up the query
    const viewQuery = `
SELECT 
   d.department_id,
   d.department_name,
   d.over_head_costs,
   SUM(IFNULL(p.product_sales, 0)) as product_sales,
   SUM(IFNULL(p.product_sales, 0)) - d.over_head_costs as total_profit
   FROM products p 
   RIGHT JOIN departments d ON p.department_name = d.department_name
   GROUP BY
   d.department_id,
   d.department_name,
   d.over_head_costs;`;
    //  GROUP BY departments.department_name`;
    //make the query to the database
    connection.query(viewQuery, function (err, res) {
        if (err) throw err;
        const pTable = new Table({
            style: 'fatBorder',
            columns: [{
                name: 'department_id',
                alignment: 'left'
            }, {
                name: 'department_name',
                alignment: 'left'
            }, {
                name: 'over_head_costs',
                alignment: 'left'
            }, {
                name: 'product_sales',
                alignment: 'left'
            }, {
                name: 'total_profit',
                alignment: 'left'
            }]
        });
        for (ent in res) {
            //print a table
            pTable.addRow({
                department_id: res[ent].department_id,
                department_name: res[ent].department_name,
                over_head_costs: res[ent]
                    .over_head_costs
                    .toFixed(2),
                product_sales: res[ent].product_sales,
                total_profit: res[ent].total_profit
            });
        }
        console.log(`\n\n ----------------------------------------- \n\n`);
        pTable.printTable();
        console.log(`\n\n ----------------------------------------- \n\n`);
        askSupervisor();
    })
}