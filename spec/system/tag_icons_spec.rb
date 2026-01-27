# frozen_string_literal: true

require_relative "page_objects/components/tag_icon"

RSpec.describe "Tag icons" do
  fab!(:tag) { Fabricate(:tag, name: "support") }
  fab!(:topic) { Fabricate(:topic, tags: [tag]) }
  fab!(:post) { Fabricate(:post, topic:) }
  fab!(:user)

  let(:topic_page) { PageObjects::Pages::Topic.new }
  let(:tag_icon) { PageObjects::Components::TagIcon.new }
  let!(:theme) { upload_theme_component }

  before do
    SiteSetting.tagging_enabled = true
    theme.update_setting(:tag_icon_list, "support,question-circle,#ff0000")
    theme.save!
    sign_in(user)
  end

  it "displays tag with icon on topic page" do
    topic_page.visit_topic(topic)
    expect(tag_icon).to have_icon_for_tag(
      tag_name: "support",
      icon: "question-circle",
      color: "#ff0000",
    )
  end

  it "displays tag without icon when not configured" do
    theme.update_setting(:tag_icon_list, "")
    theme.save!

    topic_page.visit_topic(topic)
    expect(tag_icon).to have_no_icon_for_tag(tag_name: "support")
  end
end
