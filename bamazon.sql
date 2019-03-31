CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
    item_id INT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(75) NOT NULL,
    price DECIMAL(20, 2),
    department_name VARCHAR(75) NOT NULL,
    stock_quantity INT(11) NOT NULL,
    product_sales DECIMAL(20, 2) 

);

SELECT * FROM products;