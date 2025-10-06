# Customer Inventory Management System 


[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-dark?style=flat-square)](https://github.com/Anush980)
![GitHub last commit](https://img.shields.io/github/last-commit/Anush980/CIMS_Backend?style=flat-square)


The backend for the Customer Inventory Management System (CIMS), built with **Node.js**, **Express.js**, and **MongoDB**. This API handles user authentication, customer management, inventory tracking, and order processing.

---

## 🛠 Technologies Used (Backend)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

---

### ⚠️ Note
> The frontend for this project is in a **separate repository** (React.js, Html5, CSS3).  
You can check it out [here](https://github.com/Anush980/Customer_Inventory_Management_System?tab=readme-ov-file)

---

## 📦 Features

- **User Authentication**: Secure login and registration using JWT.
- **Customer Management**: CRUD operations for customer records.
- **Inventory Tracking**: Manage product quantities and stock levels.
- **Order Processing**: Create and manage customer orders.

---

## 🌐 Live Demo

[![Live Demo](https://img.shields.io/badge/CIMS%20Demo-Click-0D1117?style=for-the-badge&logo=github&logoColor=black)](https://cims-ebon.vercel.app/dashboard)

---
## 📄 License

This project is open-source under the [MIT License](./LICENSE).  
You can use, change, or share it — just give proper credit.

## 🚀 Installation (Backend)

1. **Clone the repository**
```bash
git clone https://github.com/Anush980/CIMS_Backend.git
cd CIMS_Backend
```
2. **Install dependencies**
```bash
npm install
```
3. **Set up environment variables**
 ```bash
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
```
4. **Start the server**
```bash
nodemon server.js
```
---
## 📸 API Endpoints (Up to now)

| Method | Endpoint                | Description                                |
| ------ | ---------------------   | ------------------------------------------ |
| POST   | /api/auth/register      | Register a new user                        |
| POST   | /api/auth/login         | Login and receive a JWT token              |
| GET    | /api/customer           | Retrieve all customers                     |
| POST   | /api/customer           | Add a new customer                         |
| PUT    | /api/customer/:id       | Update an existing customer                |
| DELETE | /api/customer/:id       | Delete a customer                          |
| GET    | /api/customer?search    | Search customers by name or other fields   |
| GET    | /api/inventory          | Retrieve all products                      |
| POST   | /api/inventory          | Add a new product                          |
| PUT    | /api/inventory/:id      | Update an existing product                 |
| DELETE | /api/inventory/ :id     | Delete a product                           |
| GET    | /api/inventory?search   | Search inventory by name, SKU, or category |
| GET    | /api/inventory?category | Filter inventory by category               |
| GET    | /api/sales              | Retrieve all sales                         |
| POST   | /api/sales              | Create a new sale                          |
| PUT    | /api/sales/:id          | Update an existing sale                    |
| DELETE | /api/sales/:id          | Delete a sale                              |
| GET    | /api/sales?search       | Search sales by customer or product name   |

---


Built by [Anush980](https://github.com/Anush980) – Feel free to ⭐ the repo or contribute!



   