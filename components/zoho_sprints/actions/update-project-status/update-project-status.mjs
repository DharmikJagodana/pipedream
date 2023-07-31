import zohoSprints from "../../zoho_sprints.app.mjs";

export default {
  key: "zoho_sprints",
  name: "Zoho Sprints",
  description: "Changes the status of an existing project in Zoho Sprints. [See the documentation](https://sprints.zoho.com/apidoc.html#Updateproject)",
  version: "0.0.1",
  type: "action",
  props: {
    zohoSprints,
    teamId: {
      propDefinition: [
        zohoSprints,
        "teamId",
      ],
    },
    projectId: {
      propDefinition: [
        zohoSprints,
        "projectId",
        (c) => ({
          teamId: c.teamId,
        }),
      ],
    },
    statusId: {
      propDefinition: [
        zohoSprints,
        "statusId",
        (c) => ({
          teamId: c.teamId,
          projectId: c.projectId,
        }),
      ],
    },
  },
  async run({ $ }) {
    const response = await this.zohoSprints.updateProject({
      teamId: this.teamId,
      projectId: this.projectId,
      data: {
        status: this.statusId,
      },
      $,
    });

    $.export("$summary", `Successfully updated project status for project with ID ${this.projectId}`);

    return response;
  },
};
