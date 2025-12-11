import axios from "./axios";

const onboardingApi = {
  getQuestions() {
    return axios.get("api/onboarding");
  }
};

export default onboardingApi;
