# Econo Mart – E-Commerce Platform

A full-stack e-commerce application designed to provide a complete online shopping experience, with product management, order processing, customer accounts, and real-time communication.

🌐 **Live Website:** [economart.store](https://economart.store)

## About

Econo Mart is an e-commerce project I developed to bring together the essential features of an online shopping platform.

The application supports customers throughout the shopping process, from browsing products and managing their carts to placing orders and tracking their purchases. It also includes backend management features for handling products, customers, and orders.

I built the backend with Django and Django REST Framework, while React handles the frontend and application state.

## Features

- **User Authentication** – Customer registration, login, and account management.
- **Product Management** – Browse products, brands, categories, colors, and sizes.
- **Shopping Cart** – Add, update, and manage cart items.
- **Order Management** – Place orders and manage order information.
- **Payment Integration** – Stripe payment integration.
- **Real-Time Communication** – WebSocket-based chat and notifications.
- **Support System** – Customer support ticket management.
- **Responsive Interface** – User-friendly interface for different screen sizes.
- **API Integration** – REST APIs for communication between frontend and backend.

## Tech Stack

| Category | Technologies |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Frontend | React, JavaScript |
| UI | Ant Design |
| State Management | Redux Toolkit |
| Database | PostgreSQL |
| Real-Time | Django Channels, WebSockets |
| Payment | Stripe |
| Server | Ubuntu, Apache, Daphne |
| Version Control | Git, GitHub |

## Project Structure

```text
EconoMart/
│
├── Backend/
│   ├── chat/
│   ├── core/
│   ├── master/
│   ├── notification/
│   ├── order/
│   ├── product/
│   ├── real_time_connection/
│   ├── support_request/
│   ├── user/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd EconoMart
```

### 2. Backend Setup

```bash
cd Backend
python -m venv .venv
```

Activate the environment:

```bash
# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your `.env` file with the required Django, database, and payment settings.

Run migrations and start Django:

```bash
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the required frontend environment variables before starting the application.

## Deployment

The application is deployed on a Linux VPS using:

- Ubuntu Server
- Apache
- Daphne (ASGI)
- PostgreSQL
- Redis
- HTTPS / SSL

## Author

**Kartik Prajapati**

*Designed and developed by Kartik Prajapati.*