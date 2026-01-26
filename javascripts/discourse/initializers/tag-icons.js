import TagHashtagType from "discourse/lib/hashtag-types/tag";
import { iconHTML } from "discourse/lib/icon-library";
import { withPluginApi } from "discourse/lib/plugin-api";
import { defaultRenderTag } from "discourse/lib/render-tag";
import { contrastColor } from "../lib/colors";

function iconTagRenderer(tag, params) {
  // Get the rendered default tag markup.
  const renderedTag = defaultRenderTag(tag, params);

  // Get the tag configuration list from the settings.
  const tagIconList = settings.tag_icon_list.split("|");

  // Returns the tag configuration if found.
  const tagIconItem = tagIconList.find(
    (line) =>
      line.indexOf(",") > -1 &&
      tag.toLowerCase() === line.substr(0, line.indexOf(",")).toLowerCase()
  );

  // Update the tag markup with an SVG icon, and inline-styles for the colors.
  if (tagIconItem) {
    const [, iconName, color] = tagIconItem.split(",");

    const parser = new DOMParser();
    const tagElement = parser.parseFromString(renderedTag, "text/html").body
      .firstChild;
    const iconElement = parser.parseFromString(
      `<span class="tag-icon">${iconHTML(iconName)}</span>`,
      "text/html"
    ).body.firstChild;

    tagElement.prepend(iconElement);
    tagElement.classList.add("discourse-tag--tag-icons-style");
    tagElement.style.setProperty("--color1", color ?? "");
    tagElement.style.setProperty("--color2", color ? contrastColor(color) : "");

    return tagElement.outerHTML;
  }

  return renderedTag;
}

class TagHashtagTypeWithIcon extends TagHashtagType {
  constructor(dict, owner) {
    super(owner);
    this.dict = dict;
  }

  generateIconHTML(hashtag) {
    const opt = hashtag.slug && this.dict[hashtag.slug];
    if (opt) {
      const svgIcon = iconHTML(opt.icon, {
        class: `hashtag-color--${this.type}-${hashtag.id}`,
      });
      const newIcon = document.createElement("span");
      newIcon.classList.add("hashtag-tag-icon");
      newIcon.innerHTML = svgIcon;
      if (opt.color) {
        newIcon.style.setProperty("--color1", opt.color ?? "");
        newIcon.style.setProperty(
          "--color2",
          opt.color ? contrastColor(opt.color) : ""
        );
      }
      return newIcon.outerHTML;
    }

    return super.generateIconHTML(hashtag);
  }
}

export default {
  name: "tag-icons",

  before: "hashtag-css-generator",

  initialize(owner) {
    withPluginApi((api) => {
      api.replaceTagRenderer(iconTagRenderer);

      /** @type {Record<string, { icon: string, color?: string }>} */
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
