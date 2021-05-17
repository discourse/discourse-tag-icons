import { withPluginApi } from "discourse/lib/plugin-api";
import { iconHTML } from "discourse-common/lib/icon-library";
import getURL from "discourse-common/lib/get-url";
import Handlebars from "handlebars";
import { helperContext } from "discourse-common/lib/helpers";

function iconTagRenderer(tag, params) {
  let siteSettings = helperContext().siteSettings;
  let tagIconList = settings.tag_icon_list.split("|");

  params = params || {};
  const visibleName = Handlebars.Utils.escapeExpression(tag);
  tag = visibleName.toLowerCase();

  const classes = ["discourse-tag"];
  const tagName = params.tagName || "a";
  let path;
  if (tagName === "a" && !params.noHref) {
    if (params.isPrivateMessage && Discourse.User.current()) {
      const username = params.tagsForUser
        ? params.tagsForUser
        : Discourse.User.current().username;
      path = `/u/${username}/messages/tags/${tag}`;
    } else {
      path = `/tag/${tag}`;
    }
  }
  const href = path ? ` href='${getURL(path)}' ` : "";
  if (siteSettings.tag_style || params.style) {
    classes.push(params.style || siteSettings.tag_style);
  }

  /// Add custom tag icon from theme settings
  let tagIconItem = tagIconList.find((str) => {
    return str.indexOf(",") > -1 ? tag === str.substr(0, str.indexOf(",")) : "";
  });

  let tagIconHTML = "";
  if (tagIconItem) {
    let tagIcon = tagIconItem.split(",");

    let itemColor = tagIcon[2] ? `style="color: ${tagIcon[2]}"` : "";
    tagIconHTML = `<span ${itemColor} class="tag-icon">${iconHTML(
      tagIcon[1]
    )}</span>`;
  }
  /// End custom tag icon

  let val =
    "<" +
    tagName +
    href +
    " data-tag-name=" +
    tag +
    " class='" +
    classes.join(" ") +
    "'>" +
    tagIconHTML + // inject tag Icon in html
    visibleName +
    "</" +
    tagName +
    ">";

  if (params.count) {
    val += " <span class='discourse-tag-count'>x" + params.count + "</span>";
  }

  return val;
}

export default {
  name: "tag-icons",

  initialize() {
    withPluginApi("0.8.31", (api) => {
      api.replaceTagRenderer(iconTagRenderer);
    });
  },
};
