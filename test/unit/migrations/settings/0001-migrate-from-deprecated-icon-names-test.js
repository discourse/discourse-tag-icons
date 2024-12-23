import { module, test } from "qunit";
import migrate from "../../../../migrations/settings/0001-migrate-from-deprecated-icon-names";

module(
  "Unit | Migrations | Settings | 0001-migrate-from-deprecated-icon-names",
  function () {
    test("migrate", function (assert) {
      const settings = new Map(
        Object.entries({
          tag_icon_list:
            "tag1,fab-facebook|tag2,fab-twitter,#CC0011|tag3,fab fa-cog,#CC0012|tag4,user-friends",
          svg_icons: "fab-facebook|fab-twitter|fab-cog|user-friends",
        })
      );

      const result = migrate(settings);

      const expectedResult = new Map(
        Object.entries({
          tag_icon_list:
            "tag1,fab-facebook|tag2,fab-twitter,#CC0011|tag3,fab-gear,#CC0012|tag4,user-group",
          svg_icons: "fab-facebook|fab-twitter|fab-gear|user-group",
        })
      );
      assert.deepEqual(Array.from(result), Array.from(expectedResult));
    });
  }
);
