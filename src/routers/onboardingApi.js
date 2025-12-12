import axios from "../routers/axios";

const onboardingApi = {
  async getQuestions() {
    try {
      const res = await axios.get("api/onboarding");
      return res;     
    } catch (error) {
      console.error("onboardingApi.getQuestions error:", error.response?.data || error);
      return null;
    }
  },

  async submitAnswers(payload) {
    try {
      const res = await axios.post("api/onboarding/submit", payload);
      return res;
    } catch (error) {
      console.error("onboardingApi.submitAnswers error:", error.response?.data || error);
      return null;
    }
  }
};

export default onboardingApi;
