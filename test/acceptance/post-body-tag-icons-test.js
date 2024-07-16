import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import TopicFixtures from "discourse/tests/fixtures/topic";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import { cloneJSON } from "discourse-common/lib/object";

function makeHashtagHTML(tag) {
  return `<a class=\"hashtag-cooked\" href=\"${tag.href}\" data-type=\"tag\" data-slug=\"${tag.slug}\" data-id=\"${tag.id}\"><span class=\"hashtag-icon-placeholder\"><svg class=\"fa d-icon d-icon-square-full svg-icon svg-node\"><use href=\"#square-full\"></use></svg></span><span>${tag.name}</span></a>`;
}

acceptance("Post body - Tag icons", function (needs) {
  needs.user();

  const tags = [
    {
      id: 1,
      name: "Test-1",
      slug: "test-1",
      color: "111111",
    },
    {
      id: 2,
      name: "Test-2",
      slug: "test-2",
      color: "000000",
    },
    {
      id: 3,
      name: "Test-3",
      slug: "test-3",
      color: "888888",
    },
  ];

  needs.hooks.beforeEach(function () {
    settings.tag_icon_list = `test-1,wrench,#FF0000|test-2,question-circle`;
  });

  needs.pretender((server, helper) => {
    server.get("/t/131.json", () => {
      const topicList = cloneJSON(TopicFixtures["/t/130.json"]);
      topicList.post_stream.posts[0].cooked = `<p>${makeHashtagHTML(
        tags[0]
      )} ${makeHashtagHTML(tags[1])} ${makeHashtagHTML(tags[2])}</p>`;
      return helper.response(topicList);
    });
  });

  test("Icon for tag when `tag_icon_list` theme setting has been configured", async function (assert) {
    await visit("/t/131");

    assert
      .dom(
        `.cooked .hashtag-cooked[data-id="1"] .hashtag-tag-icon .d-icon-wrench`
      )
      .exists("wrench icon is displayed for tag-1");

    assert
      .dom(`.cooked .hashtag-cooked[data-id="1"] .hashtag-tag-icon`)
      .hasStyle(
        { color: "rgb(255, 0, 0)" },
        "tag-1 's icon has the right color"
      );

    assert
      .dom(
        `.cooked .hashtag-cooked[data-id="2"] .hashtag-tag-icon .d-icon-question-circle`
      )
      .exists("question-circle icon is displayed for tag-2");

    assert
      .dom(`.cooked .hashtag-cooked[data-id="3"] svg.d-icon-tag`)
      .exists("unconfigured tags have a default badge");
  });
});
