## Versa Application Database Schema

This document outlines the database schema for the hypothetical Versa application, designed to manage users, products, orders, and order items. The schema consists of four main tables: `Users`, `Products`, `Orders`, and `OrderItems`, with appropriate primary and foreign key relationships to ensure data integrity.

### Table Descriptions:

*   **Users:** Stores user information including `user_id`, `username`, `email`, and `created_at`.
*   **Products:** Contains details about available products such as `product_id`, `name`, `description`, `price`, and `stock`.
*   **Orders:** Records customer orders, linking to users and including `order_id`, `user_id`, `order_date`, `total_amount`, and `status`.
*   **OrderItems:** Details the individual items within each order, with `order_item_id`, `order_id`, `product_id`, `quantity`, and `price_at_purchase`.
