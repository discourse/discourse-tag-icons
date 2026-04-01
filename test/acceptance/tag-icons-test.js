import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import topicFixtures from "discourse/tests/fixtures/topic";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Topic with tags", function (needs) {
  needs.settings({ tagging_enabled: true, force_lowercase_tags: false });

  needs.site({
    top_tags: [
      { id: 1, name: "tag1", slug: "tag1" },
      { id: 2, name: "Tag2", slug: "tag2" },
      { id: 3, name: "newsman", slug: "newsman" },
    ],
  });

  const topicResponse = topicFixtures["/t/280/1.json"];
  topicResponse.tags = [
    { id: 1, name: "tag1", slug: "tag1" },
    { id: 2, name: "Tag2", slug: "tag2" },
    { id: 3, name: "newsman", slug: "newsman" },
  ];
  topicResponse.tags_descriptions = {
    newsman: "newsman <a href='test'>link</a>",
  };

  test("Decorate topic title", async function (assert) {
    await visit("/t/internationalization-localization/280");

    assert.dom(".title-wrapper .discourse-tags").exists("has tags");
    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon")
      .exists("has tag icon");

    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon")
      .hasStyle(
        { color: "rgb(100, 100, 100)" },
        "tag icon color matches default value"
      );
  });

  test("Tag icon exact matches only", async function (assert) {
    settings.tag_icon_list = "news,question-circle|newsman,gear";

    await visit("/t/internationalization-localization/280");

    assert.dom(".title-wrapper .discourse-tags").exists("has tags");
    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon")
      .exists("has tag icon");

    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon .d-icon")
      .hasClass("d-icon-gear", "tag matches correct icon");

    assert
      .dom(".discourse-tag[data-tag-name='newsman']")
      .hasAttribute(
        "title",
        "newsman link",
        "has correct title without markup"
      );
  });

  test("Tag uppercase matches", async function (assert) {
    settings.tag_icon_list = "Tag2,star";

    await visit("/t/internationalization-localization/280");

    assert.dom(".title-wrapper .discourse-tags").exists("has tags");
    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon")
      .exists("has tag icon");

    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon .d-icon")
      .hasClass("d-icon-star", "tag matches correct icon");
  });

  test("Ensure non-HEX colors do not throw an error", async function (assert) {
    settings.tag_icon_list = "Tag2,star,rgba(0,0,0)";

    await visit("/t/internationalization-localization/280");

    assert.dom(".title-wrapper .discourse-tags").exists("has tags");
    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon")
      .exists("has tag icon");
  });
});

acceptance("Topic with translated tags", function (needs) {
  needs.settings({ tagging_enabled: true });

  needs.site({
    top_tags: [{ id: 10, name: "intelligence-artificielle", slug: "ai" }],
  });

  const topicResponse = topicFixtures["/t/280/1.json"];
  const originalTags = topicResponse.tags;

  needs.hooks.afterEach(function () {
    topicResponse.tags = originalTags;
  });

  test("Displays correct icon for tags with translated names", async function (assert) {
    settings.tag_icon_list = "ai,robot,#5865F2";
    topicResponse.tags = [
      { id: 10, name: "intelligence-artificielle", slug: "ai" },
    ];

    await visit("/t/internationalization-localization/280");

    assert
      .dom(".discourse-tags a.discourse-tag .tag-icon .d-icon")
      .hasClass("d-icon-robot", "correct icon is shown");

    assert
      .dom(".discourse-tags a.discourse-tag")
      .hasClass(
        "discourse-tag--tag-icons-style",
        "tag has icon style class applied"
      );
  });
});
