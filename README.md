# Resource Sharing Platform

A web application built with Node.js, React, and Vite for seamless resource sharing. The backend is powered by Supabase for real-time database capabilities and user authentication.

Preview link: https://resourcesharinghub.netlify.app/

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication using Supabase
- Real-time data updates
- Easy resource sharing and management
- Responsive design for various devices
- Intuitive user interface

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Installation

To set up the project locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Supabase account (sign up at [Supabase](https://supabase.io/))

### Clone the Repository

```bash
git clone https://github.com/your-username/resource-sharing-platform.git
cd resource-sharing-platform

#Install Dependencies
# Navigate to the frontend
cd frontend
npm install


# Navigate to the backend
cd ../backend
npm install

#Set Up Environment Variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Usage
Start the Development Server

Start the backend server:
cd backend
npm run dev

Start the frontend server:
cd frontend
npm run dev



