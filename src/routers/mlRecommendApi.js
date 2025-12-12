import axios from "./axios";

const mlRecommendApi = {
  async getCandidates(payload) {
    const res = await axios.post("api/ml/candidates", payload);
    return res;
  },

  async getRecommend(payload) {
    const res = await axios.post("api/ml/recommend", payload);
    return res;
  },
};

export default mlRecommendApi;
