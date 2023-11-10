import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import topicFixtures from "discourse/tests/fixtures/topic";
import { acceptance, queryAll } from "discourse/tests/helpers/qunit-helpers";

acceptance("Topic with tags", function (needs) {
  needs.settings({ tagging_enabled: true, force_lowercase_tags: false });

  const topicResponse = topicFixtures["/t/280/1.json"];
  topicResponse.tags = ["tag1", "newsman"];
  topicResponse.tags_descriptions = {
    newsman: "newsman <a href='test'>link</a>",
  };

  test("Decorate topic title", async function (assert) {
    await visit("/t/internationalization-localization/280");

    assert.ok(queryAll(".title-wrapper .discourse-tags"), "it has tags");
    assert.ok(
      queryAll(".discourse-tags a.discourse-tag .tag-icon").length,
      "it has tag icon"
    );

    const el = queryAll(".discourse-tags a.discourse-tag .tag-icon")[0];

    assert.equal(
      window.getComputedStyle(el).color,
      "rgb(204, 0, 0)",
      "tag icon color matches default value"
    );
  });

  test("Tag icon exact matches only", async function (assert) {
    settings.tag_icon_list = "news,circle-question|newsman,gear";

    await visit("/t/internationalization-localization/280");

    assert.ok(queryAll(".title-wrapper .discourse-tags"), "it has tags");
    assert.ok(
      queryAll(".discourse-tags a.discourse-tag .tag-icon").length,
      "it has tag icon"
    );

    const el = queryAll(".discourse-tags a.discourse-tag .tag-icon .d-icon")[0];
    assert.ok(el.classList.contains("d-icon-gear"), "tag matches correct icon");

    assert
      .dom(".discourse-tag[data-tag-name='newsman']")
      .hasAttribute(
        "title",
        "newsman link",
        "it has correct title without markup"
      );
  });

  test("Tag uppercase matches", async function (assert) {
    settings.tag_icon_list = "Tag2,star";

    await visit("/t/internationalization-localization/280");

    assert.ok(queryAll(".title-wrapper .discourse-tags"), "it has tags");
    assert.ok(
      queryAll(".discourse-tags a.discourse-tag .tag-icon").length,
      "it has tag icon"
    );

    const el = queryAll(".discourse-tags a.discourse-tag .tag-icon .d-icon")[0];
    assert.ok(el.classList.contains("d-icon-star"), "tag matches correct icon");
  });
});
