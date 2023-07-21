import { defineApp } from "@pipedream/types";
import { axios } from "@pipedream/platform";
import { HttpRequestParams } from "../common/types";

export default defineApp({
  type: "app",
  app: "google_my_business",
  methods: {
    _baseUrl() {
      return "https://mybusiness.googleapis.com/v4";
    },
    async _httpRequest({
      $ = this,
      ...args
    }: HttpRequestParams): Promise<object> {
      return axios($, {
        ...args,
      });
    },
  },
});
