import axios from "../routers/axios";

const userApi = {
  async register(name, email, password) {
    try {
      const res = await axios.post("api/user/register", {
        name,
        email,
        password
      });
      return res;       // res.data là dữ liệu backend trả về
    } catch (error) {
      console.error("userApi.register error:", error.response?.data || error);
      return null;
    }
  },

  async login(email, password) {
    try {
      const res = await axios.post("api/user/login", {
        email,
        password
      });
      return res;
    } catch (error) {
      console.error("userApi.login error:", error.response?.data || error);
      return null;
    }
  },
}

export default userApi;
