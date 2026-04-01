import TagHashtagType from "discourse/lib/hashtag-types/tag";
import { iconHTML } from "discourse/lib/icon-library";
import { withPluginApi } from "discourse/lib/plugin-api";
import { defaultRenderTag } from "discourse/lib/render-tag";
import { contrastColor } from "../lib/colors";

function parseTagIconList() {
  const nameMap = {};
  const tagIconList = settings.tag_icon_list.split("|");

  tagIconList.forEach((tagIcon) => {
    const [tagName, icon, color] = tagIcon.split(",");
    if (tagName && icon) {
      nameMap[tagName.toLowerCase()] = { icon, color };
    }
  });

  return nameMap;
}

function buildIdMap(nameMap, site) {
  const idMap = {};
  const tags = site.top_tags || [];

  tags.forEach((tag) => {
    const config =
      (tag.slug && nameMap[tag.slug.toLowerCase()]) ||
      nameMap[tag.name.toLowerCase()];
    if (config) {
      idMap[tag.id] = config;
    }
  });

  return idMap;
}

function findConfig(idMap, nameMap, tag) {
  if (typeof tag === "object") {
    return idMap[tag.id];
  }

  // Legacy fallback: older Discourse versions pass tag as a string
  return nameMap[tag.toLowerCase()];
}

function iconTagRenderer(idMap, nameMap, tag, params) {
  const renderedTag = defaultRenderTag(tag, params);
  const tagIconItem = findConfig(idMap, nameMap, tag);

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
  constructor(idMap, owner) {
    super(owner);
    this.idMap = idMap;
  }

  generateIconHTML(hashtag) {
    const opt = this.idMap[hashtag.id];

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
      const nameMap = parseTagIconList();
      const site = api.container.lookup("service:site");
      const idMap = buildIdMap(nameMap, site);

      api.replaceTagRenderer((tag, params) =>
        iconTagRenderer(idMap, nameMap, tag, params)
      );

      // Register sidebar icons — core API is name-based, use original tag names
      Object.entries(nameMap).forEach(([tagName, { icon, color }]) => {
        if (api.registerCustomTagSectionLinkPrefixIcon) {
          api.registerCustomTagSectionLinkPrefixIcon({
            tagName,
            prefixValue: icon,
            prefixColor: color,
          });
        }
      });

      if (api.registerHashtagType) {
        api.registerHashtagType(
          "tag",
          new TagHashtagTypeWithIcon(idMap, owner)
        );
      }
    });
  },
};
