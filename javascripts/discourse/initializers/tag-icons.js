import Handlebars from "handlebars";
import escape from "discourse/lib/escape";
import getURL from "discourse/lib/get-url";
import TagHashtagType from "discourse/lib/hashtag-types/tag";
import { helperContext } from "discourse/lib/helpers";
import { iconHTML } from "discourse/lib/icon-library";
import { withPluginApi } from "discourse/lib/plugin-api";

function iconTagRenderer(tag, params) {
  let { siteSettings, currentUser } = helperContext();
  let tagIconList = settings.tag_icon_list.split("|");

  params = params || {};
  const visibleName = Handlebars.Utils.escapeExpression(tag);
  tag = visibleName.toLowerCase();

  const classes = ["discourse-tag"];
  const tagName = params.tagName || "a";
  let path;
  if (tagName === "a" && !params.noHref) {
    if ((params.isPrivateMessage || params.pmOnly) && currentUser) {
      const username = params.tagsForUser
        ? params.tagsForUser
        : currentUser.username;
      path = `/u/${username}/messages/tags/${tag}`;
    } else {
      path = `/tag/${tag}`;
    }
  }
  const href = path ? ` href='${getURL(path)}' ` : "";
  if (siteSettings.tag_style || params.style) {
    classes.push(params.style || siteSettings.tag_style);
  }

  if (params.extraClass) {
    classes.push(params.extraClass);
  }

  if (params.size) {
    classes.push(params.size);
  }

  // remove all html tags from hover text
  const hoverDescription =
    params.description && params.description.replace(/<.+?>/g, "");

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
    (params.description ? ' title="' + escape(hoverDescription) + '" ' : "") +
    " class='" +
    classes.join(" ") +
    "'>" +
    tagIconHTML + // inject tag Icon in html
    (params.displayName ? escape(params.displayName) : visibleName) +
    "</" +
    tagName +
    ">";

  if (params.count) {
    val += " <span class='discourse-tag-count'>x" + params.count + "</span>";
  }

  return val;
}

class TagHashtagTypeWithIcon extends TagHashtagType {
  constructor(dict, owner) {
    super(owner);
    this.dict = dict;
  }

  generateIconHTML(hashtag) {
    const opt = hashtag.slug && this.dict[hashtag.slug];
    if (opt) {
      const newIcon = document.createElement("span");
      newIcon.classList.add("hashtag-tag-icon");
      newIcon.innerHTML = iconHTML(opt.icon);
      if (opt.color) {
        newIcon.style.color = opt.color;
      }
      return newIcon.outerHTML;
    } else {
      return super.generateIconHTML(hashtag);
    }
  }
}

export default {
  name: "tag-icons",

  initialize(owner) {
    withPluginApi("1.6.0", (api) => {
      api.replaceTagRenderer(iconTagRenderer);

      /** @type {Record<string, {icon: string, color: string?}?>} */
      const tagsMap = {};

      const tagIconList = settings.tag_icon_list.split("|");

      tagIconList.forEach((tagIcon) => {
        const [tagName, prefixValue, prefixColor] = tagIcon.split(",");

        if (tagName && prefixValue) {
          if (api.registerCustomTagSectionLinkPrefixIcon) {
            api.registerCustomTagSectionLinkPrefixIcon({
              tagName,
              prefixValue,
              prefixColor,
            });
          }

          tagsMap[tagName] = {
            icon: prefixValue,
            color: prefixColor,
          };
        }
      });

      if (api.registerHashtagType) {
        api.registerHashtagType(
          "tag",
          new TagHashtagTypeWithIcon(tagsMap, owner)
        );
      }
    });
  },
};
