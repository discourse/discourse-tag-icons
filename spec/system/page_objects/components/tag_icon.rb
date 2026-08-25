# frozen_string_literal: true

module PageObjects
  module Components
    class TagIcon < PageObjects::Components::Base
      # Tags are matched on the name the viewer reads, so these assertions hold
      # whether or not a localization applies.
      def has_icon_for_tag?(tag_name:, icon:, color: nil)
        selector = ".discourse-tag"
        selector += "[style*='--color1: #{color}; --color2: #fffd;']" if color

        page.has_css?("#{selector}:has(.tag-icon .d-icon-#{icon})", text: tag_name)
      end

      def has_no_icon_for_tag?(tag_name:)
        page.has_css?(".discourse-tag", text: tag_name) &&
          page.has_no_css?(".discourse-tag:has(.tag-icon)", text: tag_name)
      end
    end
  end
end
