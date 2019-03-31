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

function showProducts() {
    let products = `SELECT item_id, product_name, price, department_name, stock_quantity FROM products`;
    connection.query(products, function (err, res) {
        if (err) {
            console.log(`An error has occurred: ${err}`);
        }
        //create a table 
        const pTable = new Table({
            style: 'fatBorder'
        });
        for (ent in res) {
            //print a table
            pTable.addRow({
                item_id: res[ent].item_id,
                product_name: res[ent].product_name,
                price: res[ent].price,
                department_name: res[ent].department_name,
                stock_quantity: res[ent].stock_quantity
            });
        }
        pTable.printTable();
    })
}
showProducts();