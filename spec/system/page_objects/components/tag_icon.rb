# frozen_string_literal: true

module PageObjects
  module Components
    class TagIcon < PageObjects::Components::Base
      def has_icon_for_tag?(tag_name:, icon:, color: nil)
        selector = ".discourse-tag[data-tag-name='#{tag_name}']"
        selector += "[style*='--color1: #{color}; --color2: #fffd;']" if color
        selector += " .tag-icon .d-icon-#{icon}"
        page.has_css?(selector)
      end

      def has_no_icon_for_tag?(tag_name:)
        page.has_css?(".discourse-tag[data-tag-name='#{tag_name}']") &&
          page.has_no_css?(".discourse-tag[data-tag-name='#{tag_name}'] .tag-icon")
      end
    end
  end
end
