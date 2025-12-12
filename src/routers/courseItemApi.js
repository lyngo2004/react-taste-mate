import axios from "../routers/axios";

const courseItemApi = {
  async getAllCourseItems() {
    try {
      // TODO: nếu route BE khác, chỉ cần đổi string này
      const res = await axios.get("api/course");
      return res;
    } catch (error) {
      console.error(
        "courseItemApi.getAllCourseItems error:",
        error.response?.data || error
      );
      return null;
    }
  },
};

export default courseItemApi;
