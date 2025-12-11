import axios from "axios";
import { notification } from "antd";
// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
});

// Alter defaults after instance has been created

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  config.headers.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;

  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// // Add a response interceptor
// instance.interceptors.response.use(function (response) {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   // Do something with response data
//   if (response && response.data) return response.data;
//   return response;
// }, function (error) {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Do something with response error
//   if (error?.response?.data) return error?.response?.data?.EM;
//   return Promise.reject(error);
// });

instance.interceptors.response.use(
  function (response) {
    if (response && response.data) return response.data;
    return response;
  },

  function (error) {
    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;

      // CASE: Token invalid hoặc expired → 401
      if (status === 401) {
        notification.error({
          message: "Authorization Error",
          description: data?.EM || "Unauthorized access",
        });

        // Xóa token
        localStorage.removeItem("accessToken");

        // Redirect về login
        window.location.href = "/login";
        return;
      }

      // CASE: Backend trả lỗi có EM (EC != 0)
      if (data?.EM) {
        notification.error({
          message: "Error",
          description: data.EM,
        });

        return data;
      }
    }

    // CASE: Lỗi network / server crash
    notification.error({
      message: "Network Error",
      description: "Something went wrong. Please try again.",
    });

    return Promise.reject(error);
  }
);


export default instance;