# BlinkCart

### Project Overview

This project is a real-time order management system where:

Customers can place and track orders.

Delivery Partners can view assigned deliveries and update live status.

Admins can monitor all orders, delivery partners, and live statuses (read-only).

The system uses REST APIs for CRUD operations and WebSockets for real-time updates between customers, delivery partners, and admins.


### Stack Used

Frontend: Next + TailwindCSS + shadcn + redux

Backend: Node.js + Express.js + MongoDB + Mongoose

Authentication: JWT + Role-based Authorization

Real-time Communication: Socket.IO (WebSockets)

Dev Tools: Postman (API Testing), Nodemon (Hot reload)

### Folder Structure

blinkcart/
│── backend/          
│   ├── src/
│   │   ├── models/       
│   │   ├── routes/       
│   │   ├── middleware/  
│   │   └── server.js 
│   │   └── db.js
│   │   └── config.js      
│   └── package.json
│   └── .env
│   └── Dockerfile
│
│── frontend/             
│   ├── src/
│   │   ├── app/   
│   │   ├── components/   
│   │   ├── redux/        
│   │   └── lib/     
│   └── package.json
│   └── Dockerfile
│
└── README.md


### Setup Instructions
1. SSH commands to login to server
```bash
ssh -i blinkcart-key.pem ubuntu@43.205.203.2
```

2. Git clone
```bash
git clone https://github.com/renurao1306/BlinkCart.git
```

3. Install backend packages
```bash
cd backend
npm install
```

4. Create .env file
```bash
PORT=5000
MONGO_URI=mongodb+srv://renurao1306:r6k3fngFcJ5fotQ9@blinkcart.kpectbx.mongodb.net/?retryWrites=true&w=majority&appName=BlinkCart
JWT_SECRET=3fdcc0d9070f3059eb860fa046217885
CORS_ORIGIN=http://43.205.203.2:3000
```

5. Install frontend packages
```bash
cd ..
cd frontend
npm install
```

6. Build frontend
```bash
npm run build
```

7. Use pm2 to start backend and frontend
```bash
pm2 start npm --name "backend" -- run dev
pm2 start npm --name "frontend" -- run dev
```

8. To view logs
```bash
pm2 logs backend
pm2 logs frontend
```

### Web Socket Explanation
When a delivery partner updates the status of the order ("PICKED_UP", "ON_THE_WAY", "DELIVERED"), the same status is updated in real-time for the customer who has placed that particular order.

Similarly, even the admin gets live updates of the statuses of the orders.

### Miscellaneous

1. I don't have much knowledge on Docker Compose and Redis, so I haven't included those files. This assessment showed me that I need to work on my Docker skills.

2. How would I use a Load Balancer for horizontal scaling?

- I would create multiple instances of the backend, with the Load Balancer acting as a single entry points for all clients. 

- The Load Balancer would distribute incoming traffic across multiple instances.

- In case of failure of an instance, the Load Balancer would route traffic to other instances, and I would achieve horizontal scaling.

