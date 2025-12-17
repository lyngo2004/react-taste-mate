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
import RecommendationsPage from './pages/recommendations/recommendation.jsx'
import RegisterPage from './pages/auth/register.jsx'


let router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },

  {
    path: "/login",
    element: <LoginPage />
  },

  {
    path: "/register",
    element: <RegisterPage />
  },

  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "onboarding",
        element: <OnboardingPage />
      },
      {
        path: "recommendations",
        element: <RecommendationsPage />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
