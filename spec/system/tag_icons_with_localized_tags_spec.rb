# frozen_string_literal: true

require_relative "page_objects/components/tag_icon"

RSpec.describe "Tag icons with localized tags" do
  fab!(:support_tag) { Fabricate(:tag, name: "support", locale: "en") }
  fab!(:bug_tag) { Fabricate(:tag, name: "bug", locale: "en") }
  fab!(:support_tag_localization) do
    Fabricate(:tag_localization, tag: support_tag, locale: "ja", name: "サポート")
  end
  fab!(:bug_tag_localization) do
    Fabricate(:tag_localization, tag: bug_tag, locale: "ja", name: "バグ")
  end

  fab!(:japanese_user) { Fabricate(:user, locale: "ja") }

  fab!(:topic) { Fabricate(:topic, tags: [support_tag, bug_tag]) }
  fab!(:post) { Fabricate(:post, topic:) }
  fab!(:post_with_hashtag) { Fabricate(:post, topic:, raw: "Check out #support for help") }

  let(:topic_page) { PageObjects::Pages::Topic.new }
  let(:topic_list) { PageObjects::Components::TopicList.new }
  let(:tag_icon) { PageObjects::Components::TagIcon.new }
  let!(:theme) { upload_theme_component }

  before do
    SiteSetting.tagging_enabled = true
    SiteSetting.allow_user_locale = true
    SiteSetting.content_localization_enabled = true
    SiteSetting.content_localization_supported_locales = "en|ja"

    theme.update_setting(:tag_icon_list, "support,question-circle,#ff0000|bug,wrench,#0000ff")
    theme.update_setting(:svg_icons, "question-circle|wrench")
    theme.save!

    sign_in(japanese_user)
  end

  it "displays tag icons on the discovery page with localized tag names" do
    visit "/latest"
    expect(topic_list).to have_topic(topic)
    expect(tag_icon).to have_icon_for_tag(
      tag_name: "サポート",
      icon: "question-circle",
      color: "#ff0000",
    )
    expect(tag_icon).to have_icon_for_tag(tag_name: "バグ", icon: "wrench", color: "#0000ff")
  end

  it "displays tag icons in the topic title with localized tag names" do
    topic_page.visit_topic(topic)
    expect(tag_icon).to have_icon_for_tag(
      tag_name: "サポート",
      icon: "question-circle",
      color: "#ff0000",
    )
    expect(tag_icon).to have_icon_for_tag(tag_name: "バグ", icon: "wrench", color: "#0000ff")
  end

  it "displays tag icons for hashtags in post content" do
    topic_page.visit_topic(topic)
    expect(page).to have_css(
      ".hashtag-cooked[data-type='tag'][data-slug='support'] .hashtag-tag-icon .d-icon-question-circle",
    )
  end
end
