# Car Rental Management System

A comprehensive car rental management system built as part of the **Database 1 Course** at **AL-Quds University**. This web application provides a complete solution for managing car rentals, including customer management, vehicle tracking, reservations, maintenance records, and financial operations.

## 🚗 Features

- **Dashboard**: Overview of key metrics and system status
- **Customer Management**: Add, edit, and manage customer information
- **Vehicle Management**: Track vehicle inventory, status, and details
- **Reservations**: Handle booking requests and reservation management
- **Rental Management**: Process active rentals and rental history
- **Maintenance Tracking**: Monitor vehicle maintenance schedules and records
- **Invoice Management**: Generate and manage rental invoices
- **Payment Processing**: Track payments and financial transactions
- **User Authentication**: Secure login and user management

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **bun** package manager
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/hamarshehmhmd/Car_Rental_Management_System_DBProject

cd Car_Rental_Management_System_DBProject
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun (recommended for faster installation):
```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

This project uses Supabase as the backend database. Make sure to:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the required database tables and relationships
3. Configure Row Level Security (RLS) policies as needed
4. Update the environment variables with your project credentials

### 5. Run the Development Server

```bash
npm run dev
```

Or with bun:
```bash
bun run dev
```

The application will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run build:dev` - Build the project in development mode
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility libraries and configurations
├── pages/              # Application pages/routes
├── services/           # API services and data fetching
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and utilities
```

## 🎓 Academic Context

This project was developed as part of the **Database 1 Course** at **AL-Quds University**. It demonstrates practical application of database concepts including:

- Database design and normalization
- Entity-relationship modeling
- SQL queries and operations
- Data integrity and constraints
- User authentication and authorization
- Real-world database application development

## 🔐 Authentication

The application includes a secure authentication system. Users need to log in to access the main features. The login page is accessible at `/login`.

## 📱 Responsive Design

The application is fully responsive and works seamlessly across different device sizes, from mobile phones to desktop computers.

## 🤝 Contributing

This is an academic project. If you're a fellow student or instructor and would like to contribute or provide feedback, please feel free to open an issue or submit a pull request.

## 📄 License

This project is created for educational purposes as part of the Database 1 Course at AL-Quds University.

---

**Course**: Database 1  
**Institution**: AL-Quds University  
**Academic Year**: 2025 
