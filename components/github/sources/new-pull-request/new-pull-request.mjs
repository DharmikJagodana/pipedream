import { DEFAULT_POLLING_SOURCE_TIMER_INTERVAL } from "@pipedream/platform";
import github from "../../github.app.mjs";
import commonWebhook from "../common/common-webhook.mjs";
import constants from "../common/constants.mjs";

const DOCS_LINK =
  "https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request";

export default {
  key: "github-new-or-updated-pull-request",
  name: "New or Updated Pull Request",
  description: `Emit new events when a pull request is opened or updated [See the documentation](${DOCS_LINK})`,
  version: "1.0.5",
  type: "source",
  dedupe: "unique",
  props: {
    github,
    db: "$.service.db",
    http: "$.interface.http",
    timer: {
      type: "$.interface.timer",
      default: {
        intervalSeconds: DEFAULT_POLLING_SOURCE_TIMER_INTERVAL,
      },
    },
    repoFullname: {
      propDefinition: [
        github,
        "repoFullname",
      ],
      reloadProps: true,
    },
  },
  async additionalProps() {
    const props = {};
    await this.checkWebhookCreation();

    if (this._getWebhookId()) {
      props.eventTypes = {
        type: "string[]",
        label: "Filter Event Types",
        description: `Specify the types of pull request activity that should emit events. [See the documentation](${DOCS_LINK}) for more information on each type. By default, events will be emitted for all activity.`,
        options: constants.EVENT_TYPES_PULL_REQUEST,
        optional: true,
      };
    } else {
      props.emitUpdates = {
        type: "boolean",
        label: "Emit Updates",
        description:
          "If `false`, events will only be emitted when a new pull request is created.",
        default: true,
      };
    }

    return props;
  },
  methods: {
    ...commonWebhook.methods,
    getAdmin() {
      return this.db.get("isAdmin");
    },
    setAdmin(value) {
      this.db.set("isAdmin", value);
    },
    getRepoName() {
      return this.db.get("repoName");
    },
    setRepoName(value) {
      this.db.set("repoName", value);
    },
    getWebhookEvents() {
      return [
        "pull_request",
      ];
    },
    async checkAdminPermission() {
      const { repoFullname } = this;
      const { login: username } = await this.github.getAuthenticatedUser();
      const { user: { permissions: { admin } } } = await this.github.getUserRepoPermissions({
        repoFullname,
        username,
      });
      return admin;
    },
    async checkWebhookCreation() {
      const { repoFullname } = this;
      if (repoFullname !== this.getRepoName()) {
        const admin = await this.checkAdminPermission();

        this.setRepoName(repoFullname);
        if (admin) {
          await this.createWebhook();
        } else await this.removeWebhook();
      }
    },
    checkEventType(type) {
      const { eventTypes } = this;
      if (eventTypes) {
        return typeof eventTypes === "string"
          ? eventTypes === type
          : eventTypes.includes(type);
      }

      return true;
    },
  },
  hooks: {
    async activate() {
      await this.checkWebhookCreation();
    },
    async deactivate() {
      await this.removeWebhook();
    },
  },
  async run(event) {
    const ts = Date.now();

    // Webhook event
    if (this._getWebhookId()) {
      const { body } = event;
      const action = body?.action;
      if (action && this.checkEventType(action)) {
        const id = ts + action;
        const summary = `PR activity (${action}): "${body.pull_request.title}"`;

        this.$emit(body, {
          id,
          summary,
          ts,
        });
      }
    }

    // Polling schedule
    else {
      // Polling schedule
    }
  },
};
