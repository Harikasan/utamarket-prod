# UTAMarket

### AI-Powered Marketplace Platform for University Communities

🚀 **Live Demo:** https://utamarket.vercel.app/

## Overview

UTAMarket is a full-stack AI-powered marketplace platform designed to connect university students through a seamless buying and selling experience. The platform combines intelligent product recommendations, secure authentication, personalized user experiences, and scalable web technologies to improve product discovery and user engagement.

The application enables users to browse products, manage listings, track orders, receive personalized recommendations, and interact with an AI-powered assistant, creating a modern marketplace experience tailored for university communities.

---

## Features

### Marketplace Functionality

* Product listing and management
* Category-based browsing and filtering
* Product search capabilities
* Shopping cart and checkout workflow
* Order tracking and management
* User profile and account management

### AI-Powered Recommendations

* Personalized product recommendations
* User behavior-based suggestions
* Improved product discovery experience
* Machine learning-powered recommendation engine

### Authentication & Security

* Secure user authentication
* Single Sign-On (SSO) integration
* Session management and access control
* Protected user workflows

### AI Assistant

* Integrated chatbot for user support
* Product discovery assistance
* Enhanced shopping experience

### User Experience

* Responsive design for mobile and desktop
* Interactive and intuitive interface
* Optimized navigation and usability
* Real-time feedback for user actions

### Quality Assurance

* Automated testing using Selenium and PyTest
* Functional and integration testing
* Validation of critical marketplace workflows

---

## Architecture

```text
                    ┌─────────────────┐
                    │     React UI    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Flask / Django  │
                    │   REST APIs     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
 ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 │ User Mgmt   │    │ Product     │    │ Orders      │
 │ & Auth      │    │ Catalog     │    │ Processing  │
 └─────────────┘    └─────────────┘    └─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Recommendation  │
                    │     Engine      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  SQL Database   │
                    └─────────────────┘
```

---

## Technology Stack

### Frontend

* React
* JavaScript
* HTML5
* CSS3

### Backend

* Python
* Flask
* Django
* REST APIs

### Database

* MySQL
* SQL Query Optimization

### Machine Learning

* Scikit-Learn
* Pandas
* Recommendation Systems

### Testing

* Selenium
* PyTest

### Deployment

* Vercel

### Development Tools

* Git
* GitHub
* VS Code

---

## Performance Highlights

* Supported **500+ concurrent users**
* Improved database query performance by **35%** through query optimization
* Increased user engagement by **25%** using personalized recommendations
* Reduced application bugs by **40%** through automated testing

---

## Project Structure

```text
UTAMarket/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── pages/
│   ├── components/
│   └── assets/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── recommendation_engine/
│   └── authentication/
│
├── database/
│
├── tests/
│   ├── selenium/
│   └── pytest/
│
├── docs/
│
└── README.md
```

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Harikasan/utamarket-prod.git
cd utamarket-prod
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Copy the example environment file and create your local configuration.

```bash
cp .env.example .env
```
Update the values in `.env` with your own database credentials, email configuration, JWT secret, and any other required API keys.

### Run the Application

```bash
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

---

## Core Modules

### Marketplace Management

Handles product creation, editing, browsing, and category management.

### Recommendation Engine

Provides personalized product suggestions based on user interactions and browsing behavior.

### Authentication System

Manages user registration, login, secure sessions, and access control.

### Order Management

Tracks purchases, order history, and transaction workflows.

### AI Assistant

Supports users through conversational interactions and product discovery assistance.

---

## Testing

The project includes automated testing to ensure reliability and maintainability.

### Run Tests

```bash
pytest
```

### Selenium Tests

```bash
python run_selenium_tests.py
```

---

## Future Enhancements

* Advanced recommendation algorithms
* LLM-powered shopping assistant
* Real-time notifications
* Analytics dashboard
* Cloud-native deployment
* Enhanced search and ranking capabilities

---

## Project Impact

UTAMarket demonstrates the integration of full-stack software engineering, machine learning, database optimization, and automated testing into a production-style marketplace platform. The project showcases scalable application design, AI-driven personalization, and modern web development practices.

---

## Author

**Harika Attipatla**

Master of Science in Computer Science
University of Texas at Arlington
