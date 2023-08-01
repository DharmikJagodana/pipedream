import { axios } from "@pipedream/platform";

export default {
  type: "app",
  app: "zoho_people",
  propDefinitions: {
    form: {
      type: "string",
      label: "Form",
      description: "The form to insert a new record",
      async options() {
        const res = await this.listForms();
        return res.response.result.map((form) => ({
          label: form.displayName,
          value: form.formLinkName,
        }));
      },
    },
    record: {
      type: "string",
      label: "Record",
      description: "The record to update",
      async options(ctx) {
        const res = await this.listFormRecords(ctx.form, ctx.page);

        if (!res.response?.result) {
          return [];
        }

        const options = [];
        for (const record of res.response.result) {
          const [
            key,
          ] = Object.keys(record);
          options.push({
            label: key,
            value: key,
          });
        }
        return options;
      },
    },
  },
  methods: {
    _getAccessToken() {
      return this.$auth.oauth_access_token;
    },
    _getBaseUrl() {
      return "https://people.zoho.com/people/api";
    },
    _getHeaders() {
      return {
        "Content-Type": "application/json",
        "Authorization": `Zoho-oauthtoken ${this._getAccessToken()}`,
      };
    },
    async _makeHttpRequest(opts = {}, ctx = this) {
      const axiosOpts = {
        ...opts,
        url: this._getBaseUrl() + opts.path,
        headers: this._getHeaders(),
      };
      console.log(axiosOpts);
      return axios(ctx, axiosOpts);
    },
    async listForms() {
      return this._makeHttpRequest({
        path: "/forms",
      });
    },
    async listFieldsOfForm(formLinkName) {
      return this._makeHttpRequest({
        path: `/forms/${formLinkName}/components`,
      });
    },
    async insertRecord(formLinkName, data) {
      return this._makeHttpRequest({
        method: "POST",
        path: `/forms/json/${formLinkName}/insertRecord`,
        params: {
          inputData: JSON.stringify(data),
        },
      });
    },
    async updateRecord(formLinkName, recordId, data) {
      console.log(data);
      return this._makeHttpRequest({
        method: "POST",
        path: `/forms/json/${formLinkName}/updateRecord`,
        params: {
          inputData: JSON.stringify(data),
          recordId,
        },
      });
    },
    async listFormRecords(formLinkName, page, limit = 200) {
      const sIndex = page * limit + 1;
      return this._makeHttpRequest({
        path: `/forms/${formLinkName}/getRecords`,
        params: {
          sIndex,
          limit,
        },
      });
    },
    async getRecordById(formLinkName, recordId) {
      return this._makeHttpRequest({
        path: `/forms/${formLinkName}/getDataByID`,
        params: {
          recordId,
        },
      });
    },
    async createAttendance(params) {
      return this._makeHttpRequest({
        method: "POST",
        path: "/attendance",
        params: {
          dateFormat: "dd/MM/yyyy HH:mm:ss",
          ...params,
        },
      });
    },
    async getShiftConfiguration(params) {
      return this._makeHttpRequest({
        path: "/attendance/getShiftConfiguration",
        params,
      });
    },
  },
};
