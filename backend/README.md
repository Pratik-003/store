# 🛒 EcomBackend — Django + DRF E-Commerce Backend

This is a modular, scalable backend boilerplate for an e-commerce site using Django and Django Rest Framework (DRF). It’s built to support React or React Native frontends via clean REST APIs.

---

## 🚀 Features

- Modular apps: users, products, cart, orders
- JWT Authentication (DRF SimpleJWT)
- Product management
- Cart & checkout logic
- Order placement APIs
- Media file handling (e.g., product images)
- Environment-based settings (dev/prod)

---

## 📁 Folder Structure

ecombackend/
├── ecombackend/ # Project settings
├── users/ # JWT login, registration
├── products/ # Product models and APIs
├── cart/ # Cart API and business logic
├── orders/ # Order placement, invoice
├── core/ # Utilities (pagination, permissions)
├── media/ # Uploaded product images
└── requirements.txt




## 🧰 Tech Stack

- Python 3.10+
- Django 4.x
- Django Rest Framework
- Simple JWT
- PostgreSQL or SQLite
- Pillow (image handling)

Create virtual environment

python -m venv env
source env/bin/activate  # or env\Scripts\activate on Windows


Install dependencies
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

MIT License — free for personal and commercial use.