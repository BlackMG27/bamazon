let inquire = require('inquirer');
let mysql = require('mysql');
const {Table} = require('console-table-printer');

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
        const pTable = new Table({style: 'fatBorder'});
        for (ent in res) {
            //print a table
            pTable.addRow({item_id: res[ent].item_id, product_name: res[ent].product_name, price: res[ent].price, department_name: res[ent].department_name, stock_quantity: res[ent].stock_quantity});
        }
        pTable.printTable();
    })
}

function askCustomer() {
    inquire.prompt([
        {
            type: 'input',
            message: 'Enter the item id of the product you want.',
            name: 'item'
        }, {
                type: 'input',
                message: "How much would you like to buy?",
                name: 'amount'
            }
        ])
        .then(function (ans) {
            //shows the then promise works
            console.log(ans.item, ans.amount);
            //select the product of the item_id
            let item_query = `SELECT * FROM products WHERE item_id = '${ans.item}'`
            connection.query(item_query, function (err, res) {
                if (err) 
                    throw err;
                else {
                    if (ans.amount > res[0].stock_quantity) {
                        console.log(`There's not enough for that order! Try Again`);
                        askCustomer();
                    } else {
                        updateProducts(ans.item, ans.amount);
                    }
                }
            })
        })
}

function updateProducts(id, stock) {
    //grab the stock quantity
    let idQueryURL = `SELECT * FROM products WHERE item_id = '${id}'`;
    connection.query(idQueryURL, function (err, res) {
        if (err) 
            throw err;
        
        //take the stock quantity
        for (ent in res) {
            updateStockQuantity(id, res[ent].stock_quantity, stock);
            updateProductSales(id, res[ent].product_sales, stock, res[ent].price);
            reportPrice(res[ent].price, stock);
        }
    });
    inquire.prompt({
        name: 'result',
        message: 'Would you like to buy something else?',
        choices: [
            'YES', 'NO'
        ],
            type: 'list'
        })
        .then(function (ans) {
            if (ans.result === 'YES') {
                showProducts();
                askCustomer();
            } else {
                return;
            }
        })
}

function updateStockQuantity(id, start, update) {
    //subtract the update from the start value
    start = start - update;
    console.log(start);
    //add the update to the table
    connection.query(`UPDATE products SET ? WHERE ? `, [
        {
            stock_quantity: start
        }, {
            item_id: id
        }
    ], function (err, data) {
        if (err) 
            throw err;
        console.log(`\nStock_quantity has been updated!\n`);
    })
}

function updateProductSales(id, sales, update, price) {
    //add the (price * stock) to the sales
    sales = sales + (price * update);
    //update the table
    connection.query(`UPDATE products SET ? WHERE ?`, [
        {
            product_sales: sales
        }, {
            item_id: id
        }
    ], function (err, data) {
        if (err) 
            throw err;
        console.log(`\nProduct Sales have been updated\n`);
    })
}

function reportPrice(price, stock) {
    price = price * stock;
    console.log(`\nAlright! You owe ${price}. \n`);
}

showProducts();
askCustomer();