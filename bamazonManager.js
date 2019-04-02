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
            choices: [
                'View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'
            ],
            type: 'list'
        }])
        .then(function (ans) {
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
                product_sales: res[ent].product_sales
            });
        }
        console.log(`\n\n ----------------------------------------- \n\n`);
        pTable.printTable();
        console.log(`\n\n ----------------------------------------- \n\n`);
        askManager();
    })
}

function showLowInventory() {
    //show all the items where stock_quantity is less than 400
    let lowQuery = `SELECT * FROM products WHERE stock_quantity < 400`;
    connection.query(lowQuery, function (err, res) {
        if (err)
            throw err;

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
                product_sales: res[ent]
                    .product_sales
            });
        }
        console.log(`\n\n ----------------------------------------- \n\n`);
        lTable.printTable();
        console.log(`\n\n ----------------------------------------- \n\n`);
        askManager();
    })
}

function addToInventory() {
    // asks the manager for the id of the item he wants to update and how many items
    // they want to add
    inquire.prompt([{
            name: 'update_id',
            message: "Which item's stock quantity would you like to update? (Use the item_id)",
            type: 'input'
        }, {
            name: 'update_amount',
            message: "How much would you like to add?",
            type: 'input'
        }])
        .then(function (ans) {
            const addQuery = `SELECT * FROM products WHERE item_id = '${ans.update_id}'`
            connection.query(addQuery, function (err, data) {
                if (err)
                    throw err;
                for (ent in data) {
                    updateInventory(ans.update_id, data[ent].stock_quantity, ans.update_amount);
                }
            })


        })
}
//function to add to the database's inventory
function updateInventory(id, stock, update) {
    stock = stock + parseInt(update);
    connection.query(`UPDATE products SET ? WHERE ?`, [{
        stock_quantity: stock
    }, {
        item_id: id
    }], function (err, res) {
        if (err)
            throw err;
        console.log(`\nInventory was successfully updated\n`);
        console.log(`\n\n ----------------------------------------- \n\n`);
        askManager();
    })
}

function addNewProduct() {
    //ask the manager what they want to add
    inquire.prompt([{
        name: 'product_name',
        message: 'What would you like to add to the inventory?',
        type: 'input'
    }, {
        name: 'price',
        message: 'How much would this product cost?',
        type: 'input'
    }, {
        name: 'department_name',
        message: 'What category would you put this product?',
        type: 'input'
    }, {
        name: 'stock_quantity',
        message: 'How many of this would be in stock?',
        type: 'input'
    }]).then(function (ans) {
        //puts the information into the database
        connection.query(`INSERT INTO products SET ?`, {
            product_name: ans.product_name,
            price: ans.price,
            department_name: ans.department_name,
            stock_quantity: ans.stock_quantity
        }, function (err, data) {
            //if there is an error then show it
            if (err) throw err;
            //otherwise print the success message
            console.log(`\n Item successfully added \n`);
            console.log(`\n\n ----------------------------------------- \n\n`);
            askManager();
        })

    })
}

askManager();