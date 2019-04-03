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
            }]
        });
        for (ent in res) {
            //set the rows
            pTable.addRow({
                item_id: res[ent].item_id,
                product_name: res[ent].product_name,
                price: res[ent]
                    .price
                    .toFixed(2),
                department_name: res[ent].department_name,
                stock_quantity: res[ent].stock_quantity
            });
        }
        //prints the table
        pTable.printTable();
        console.log(`\n\n ----------------------------------------- \n\n`);
        //returns to menu
        askCustomer();
    })
}

function askCustomer() {
    inquire.prompt([{
            type: 'input',
            message: 'Enter the item id of the product you want.',
            name: 'item'
        }, {
            type: 'input',
            message: "How much would you like to buy?",
            name: 'amount'
        }])
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
                        //asks the customer to enter the item again
                        askCustomer();
                    } else {
                        //sends info to update the table
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
            //updates the stock_quantity
            updateStockQuantity(id, res[ent].stock_quantity, stock);
            //updates the products sales
            updateProductSales(id, res[ent].product_sales, stock, res[ent].price);
            //tells the user how much they owe
            reportPrice(res[ent].price, stock, res[ent].product_name);
            //leads to another menu 
            promptNext();
        }
    });

}

function updateStockQuantity(id, start, update) {
    //subtract the update from the start value
    start = start - parseInt(update);
    //add the update to the table
    connection.query(`UPDATE products SET ? WHERE ? `, [{
        stock_quantity: start
    }, {
        item_id: id
    }], function (err, data) {
        //if there is an error, then show the error
        if (err)
            throw err;
    })
}

function updateProductSales(id, sales, update, price) {
    //add the (price * stock) to the sales
    sales = sales + (price * update);
    //updates the table
    connection.query(`UPDATE products SET ? WHERE ?`, [{
        product_sales: sales
    }, {
        item_id: id
    }], function (err, data) {
        //if there is an error, show the error
        if (err)
            throw err;
    })
}

function reportPrice(price, stock, item) {
    //makes the price = the new price
    price = price * stock;
    //prints the total cost to the console
    console.log(`\n Alright! You owe $${price} for ${item}. \n`);
}

function promptNext() {
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
            } else {
                return;
            }
        })
}

showProducts();