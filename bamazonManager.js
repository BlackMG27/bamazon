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
});



function askManager() {
    inquire.prompt([{
        name: 'choice',
        message: 'Hello! What would you like to do?',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
        type: 'list'
    }]).then(function (ans) {
        switch (ans.choice) {
            case 'View Products for Sale':
                showProducts();
                break;
            case 'View Low Inventory':
                showLowInventory();
                break;
            case 'Add to Inventory':
                addToInventory();
                break;
            case 'Add New Product':
                addNewProduct();
                break;
        }
    })
}


function showProducts() {
    let products = `SELECT item_id, product_name, price, department_name, stock_quantity, product_sales FROM products`;
    connection.query(products, function (err, res) {
        if (err) {
            console.log(`An error has occurred: ${err}`);
        }
        //create a table
        const pTable = new Table({
            style: 'fatBorder',
            columns: [{
                name: 'item_id',
                alignment: 'left'
            }, {
                name: 'product_name',
                alignment: 'left'
            }, {
                name: 'price',
                alignment: 'left'
            }, {
                name: 'department_name',
                alignment: 'left'
            }, {
                name: 'stock_quantity',
                alignment: 'left'
            }, {
                name: 'product_sales',
                alignment: 'left'
            }]
        });
        for (ent in res) {
            //print a table
            pTable.addRow({
                item_id: res[ent].item_id,
                product_name: res[ent].product_name,
                price: res[ent]
                    .price
                    .toFixed(2),
                department_name: res[ent].department_name,
                stock_quantity: res[ent].stock_quantity,
                product_sales: res[ent].product_sales.toFixed(2)
            });
        }
        pTable.printTable();
        console.log(`\n\n ----------------------------------------- \n\n`);
        askManager();
    })
}

function showLowInventory() {
    //show all the items where stock_quantity is less than 400
    let lowQuery = `SELECT * FROM products WHERE stock_quantity < 400`;
    connection.query(lowQuery, function (err, res) {
        if (err) throw err;

        const lTable = new Table({
            style: 'fatBorder',
            columns: [{
                name: 'item_id',
                alignment: 'left'
            }, {
                name: 'product_name',
                alignment: 'left'
            }, {
                name: 'price',
                alignment: 'left'
            }, {
                name: 'department_name',
                alignment: 'left'
            }, {
                name: 'stock_quantity',
                alignment: 'left'
            }, {
                name: 'product_sales',
                alignment: 'left'
            }]
        });
        for (ent in res) {
            lTable.addRow({
                item_id: res[ent].item_id,
                product_name: res[ent].product_name,
                price: res[ent]
                    .price
                    .toFixed(2),
                department_name: res[ent].department_name,
                stock_quantity: res[ent].stock_quantity,
                product_sales: res[ent].product_sales.toFixed(2)
            });
        }
        lTable.printTable();
        console.log(`\n\n ----------------------------------------- \n\n`);
        askManager();
    })
}

askManager();