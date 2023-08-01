import { ConfigurationError } from "@pipedream/platform";
import app from "../../zoho_people.app.mjs";

export default {
  type: "action",
  key: "zoho_people-get_attendance_entries",
  name: "Get Attendance Entries",
  version: "0.0.1",
  description: "This API is used to fetch the shift configuration details of an employee. All the details of the shift, that has been configured to the employee, in the given duration can be fetched using this API. Details include shifts mapped to the employee, start and end time of the shift and holiday, Weekend set for the shift. [See the documentation](https://www.zoho.com/people/api/attendance-shift-details.html)",
  props: {
    app,
    sdate: {
      type: "string",
      label: "Start Date",
      description: "The start date of the attendance entry. The format should be `yyyy-MM-dd`",
    },
    edate: {
      type: "string",
      label: "End Date",
      description: "The end date of the attendance entry. The format should be `yyyy-MM-dd`",
    },
    empId: {
      type: "string",
      label: "Employee ID",
      description: "The employee ID of the employee",
      optional: true,
    },
    emailId: {
      type: "string",
      label: "Email ID",
      description: "The email ID of the employee",
      optional: true,
    },
    mapId: {
      type: "string",
      label: "Map ID",
      description: "The mapper ID of the employee",
      optional: true,
    },
  },
  async run({ $ }) {
    const {
      app,
      ...data
    } = this;

    if (!data.empId && !data.emailId && !data.mapId) {
      throw new ConfigurationError("One of the following fields is required: Employee ID, Email ID, Map ID");
    }
    const res = await app.getShiftConfiguration(data);
    $.export("summary", "Attendance entry successfully fetched");
    return res;
  },
};
