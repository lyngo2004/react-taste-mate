import axios from "../routers/axios";

const courseItemApi = {
  async getAllCourseItems() {
    try {
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

  async getCourseItemsByIds(ids = []) {
  try {
    const query = ids.join(",");
    const res = await axios.get(`api/course/by-ids?ids=${query}`);
    return res;
  } catch (error) {
    console.error("courseItemApi.getCourseItemsByIds error:", error.response?.data || error);
    return null;
  }
}

};

export default courseItemApi;
