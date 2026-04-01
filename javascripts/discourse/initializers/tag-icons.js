import TagHashtagType from "discourse/lib/hashtag-types/tag";
import { iconHTML } from "discourse/lib/icon-library";
import { withPluginApi } from "discourse/lib/plugin-api";
import { defaultRenderTag } from "discourse/lib/render-tag";
import { contrastColor } from "../lib/colors";

function parseTagIconList() {
  const slugMap = {};
  const tagIconList = settings.tag_icon_list.split("|");

  tagIconList.forEach((tagIcon) => {
    const [tagSlug, icon, color] = tagIcon.split(",");
    if (tagSlug && icon) {
      slugMap[tagSlug.toLowerCase()] = { icon, color };
    }
  });

  return slugMap;
}

function findConfig(slugMap, tag) {
  if (typeof tag === "object") {
    return slugMap[tag.slug?.toLowerCase()] || slugMap[tag.name?.toLowerCase()];
  }

  return slugMap[tag.toLowerCase()];
}

function iconTagRenderer(tag, params) {
  const renderedTag = defaultRenderTag(tag, params);
  const slugMap = parseTagIconList();
  const tagIconItem = findConfig(slugMap, tag);

  if (tagIconItem) {
    const { icon: iconName, color } = tagIconItem;

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
  constructor(slugMap, owner) {
    super(owner);
    this.slugMap = slugMap;
  }

  generateIconHTML(hashtag) {
    const opt = findConfig(this.slugMap, hashtag);

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

      const slugMap = parseTagIconList();

      Object.entries(slugMap).forEach(([tagSlug, { icon, color }]) => {
        if (api.registerCustomTagSectionLinkPrefixIcon) {
          api.registerCustomTagSectionLinkPrefixIcon({
            tagName: tagSlug,
            prefixValue: icon,
            prefixColor: color,
          });
        }
      });

      if (api.registerHashtagType) {
        api.registerHashtagType(
          "tag",
          new TagHashtagTypeWithIcon(slugMap, owner)
        );
      }
    });
  },
};
