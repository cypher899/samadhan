# Samadhan Frontend

Welcome to the **Samadhan** frontend. This is a modern web application built using **React**, **Vite**, and **Tailwind CSS** to streamline complaint registration and management.

---

## Features

- Secure login for users and admins
- OTP-based user registration
- Complaint submission form with source tracking
- Dashboard (planned) for complaint statistics

---

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

---

## Application Routes

| Path                | Component              | Description                                  |
|---------------------|------------------------|----------------------------------------------|
| `/`                 | `LoginPage.jsx`        | Login page with user/admin toggle            |
| `/create-new-user`  | `CreateNewUser.jsx`    | User registration form with OTP              |
| `/add-complaint`    | `AddComplaintForm.jsx` | Complaint form with multiple input sources   |
| `/home`             | `Home.jsx` (planned)   | Dashboard and analytics view (under dev)     |

---

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/samadhan-frontend.git
   cd samadhan-frontend
