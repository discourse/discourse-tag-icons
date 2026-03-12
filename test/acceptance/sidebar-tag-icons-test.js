import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Sidebar - Tag icons", function (needs) {
  needs.user({
    display_sidebar_tags: true,
    sidebar_tags: [
      { name: "tag2", pm_only: false },
      { name: "tag1", pm_only: false },
      { name: "tag3", pm_only: false },
    ],
  });

  needs.hooks.beforeEach(() => {
    settings.tag_icon_list = `tag1,wrench,#FF0000|tag2,circle-question,#FFF`;
  });

  test("Icon for tag when `tag_icon_list` theme setting has been configured", async function (assert) {
    await visit("/");

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-tag-name="tag1"] .prefix-icon.d-icon-wrench`
      )
      .exists("wrench icon is displayed for tag1 section link's prefix icon");

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-tag-name="tag1"] .sidebar-section-link-prefix`
      )
      .hasStyle(
        { color: "rgb(255, 0, 0)" },
        "tag1 section link's prefix icon has the right color"
      );

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-tag-name="tag2"] .prefix-icon.d-icon-circle-question`
      )
      .exists(
        "circle-question icon is displayed for tag2 section link's prefix icon"
      );

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-tag-name="tag2"] .sidebar-section-link-prefix`
      )
      .hasStyle(
        { color: "rgb(255, 255, 255)" },
        "tag2 section link's prefix icon has the right color"
      );
  });
});
