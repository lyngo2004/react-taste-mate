import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'antd/dist/reset.css'
import LoginPage from './pages/auth/login.jsx'
import {
  createBrowserRouter,
  RouterProvider,
}
  from "react-router";
import OnboardingPage from './pages/onboarding/onboarding.jsx';
import { Navigate } from 'react-router'

let router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },

  {
    path: "/login",
    element: <LoginPage />
  },

  // {
  //   path: "/register",
  //   element: <RegisterPage />
  // },

  {
    path: "/",
    element: <App />,
    children: [
      // {
      //   path: "home",
      //   element: <HomePage />
      // },
      {
        path: "onboarding",
        element: <OnboardingPage />
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
