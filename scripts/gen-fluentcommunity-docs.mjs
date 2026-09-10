#!/usr/bin/env node
/* Generate docs/api-reference/fluentcommunity/endpoints.json (+ overview md)
   for FluentCommunity.

   FluentCommunity publishes no REST reference (its docs site is end-user
   documentation), so the inventory is captured from the live REST route index
   (`GET /wp-json/fluent-community/v2`) and curated here: groups, slugs and
   summaries are editorial decisions the route index cannot supply. The table
   is checked against the live index on every run — an unmapped live route or
   a stale table entry fails the run with the routes named, the same
   loud-on-drift contract the other generators have.

   Run: node scripts/gen-fluentcommunity-docs.mjs [--site https://example.com]
   (defaults to FLUENT_SITE_URL; --offline skips the live check.) */
import fs from 'node:fs';

const NAMESPACE = 'fluent-community/v2';

/* [method, path, group, slug, summary]. Groups fold the small top-level
   segments into the domain they belong to (e.g. /comments and /documents
   under feeds, /invitations and /notifications under profile) so the tool
   surface stays at 8 areas for 274 operations. */
const OPS = [

  // ---- spaces: spaces, space groups, paywalls, media gallery
  ['POST', '/cart/products/create', 'spaces', 'create-cart-product', 'POST Create Cart Product'],
  ['GET', '/cart/products/search', 'spaces', 'search-cart-products', 'GET Search Cart Products'],
  ['DELETE', '/cart/spaces/{spaceId}/paywalls', 'spaces', 'delete-space-paywall', 'DELETE Delete Space Paywall'],
  ['GET', '/cart/spaces/{spaceId}/paywalls', 'spaces', 'list-space-paywalls', 'GET List Space Paywalls'],
  ['POST', '/cart/spaces/{spaceId}/paywalls', 'spaces', 'create-space-paywall', 'POST Create Space Paywall'],
  ['GET', '/media-gallery/{spaceSlug}', 'spaces', 'get-space-media-gallery', 'GET Get Space Media Gallery'],
  ['GET', '/spaces', 'spaces', 'list-spaces', 'GET List Spaces'],
  ['POST', '/spaces', 'spaces', 'create-space', 'POST Create Space'],
  ['GET', '/spaces/all-spaces', 'spaces', 'list-all-spaces', 'GET List All Spaces'],
  ['GET', '/spaces/discover', 'spaces', 'list-discoverable-spaces', 'GET List Discoverable Spaces'],
  ['GET', '/spaces/space_groups', 'spaces', 'list-space-groups', 'GET List Space Groups'],
  ['POST', '/spaces/space_groups', 'spaces', 'create-space-group', 'POST Create Space Group'],
  ['PATCH', '/spaces/space_groups/move-space', 'spaces', 'move-space-to-group', 'PATCH Move Space To Group'],
  ['PATCH', '/spaces/space_groups/re-index', 'spaces', 'reindex-space-groups', 'PATCH Reindex Space Groups'],
  ['PATCH', '/spaces/space_groups/re-index-spaces', 'spaces', 'reindex-spaces-in-groups', 'PATCH Reindex Spaces In Groups'],
  ['DELETE', '/spaces/space_groups/{id}', 'spaces', 'delete-space-group', 'DELETE Delete Space Group'],
  ['PUT', '/spaces/space_groups/{id}', 'spaces', 'update-space-group', 'PUT Update Space Group'],
  ['GET', '/spaces/users/search', 'spaces', 'search-space-users', 'GET Search Space Users'],
  ['DELETE', '/spaces/{spaceId}/by-id', 'spaces', 'delete-space-by-id', 'DELETE Delete Space By ID'],
  ['PUT', '/spaces/{spaceId}/by-id', 'spaces', 'update-space-by-id', 'PUT Update Space By ID'],
  ['DELETE', '/spaces/{spaceSlug}', 'spaces', 'delete-space-by-slug', 'DELETE Delete Space By Slug'],
  ['GET', '/spaces/{spaceSlug}/by-slug', 'spaces', 'get-space-by-slug', 'GET Get Space By Slug'],
  ['PUT', '/spaces/{spaceSlug}/by-slug', 'spaces', 'update-space-by-slug', 'PUT Update Space By Slug'],
  ['POST', '/spaces/{spaceSlug}/join', 'spaces', 'join-space', 'POST Join Space'],
  ['POST', '/spaces/{spaceSlug}/leave', 'spaces', 'leave-space', 'POST Leave Space'],
  ['POST', '/spaces/{spaceSlug}/links', 'spaces', 'create-space-link', 'POST Create Space Link'],
  ['GET', '/spaces/{spaceSlug}/lockscreens', 'spaces', 'get-space-lockscreens', 'GET Get Space Lockscreens'],
  ['PUT', '/spaces/{spaceSlug}/lockscreens', 'spaces', 'update-space-lockscreens', 'PUT Update Space Lockscreens'],
  ['GET', '/spaces/{spaceSlug}/members', 'spaces', 'list-space-members', 'GET List Space Members'],
  ['POST', '/spaces/{spaceSlug}/members', 'spaces', 'add-space-member', 'POST Add Space Member'],
  ['POST', '/spaces/{spaceSlug}/members/bulk-add', 'spaces', 'bulk-add-space-members', 'POST Bulk Add Space Members'],
  ['POST', '/spaces/{spaceSlug}/members/bulk-import', 'spaces', 'bulk-import-space-members', 'POST Bulk Import Space Members'],
  ['POST', '/spaces/{spaceSlug}/members/remove', 'spaces', 'remove-space-member', 'POST Remove Space Member'],
  ['POST', '/spaces/{spaceSlug}/members/resolve-crm-tag', 'spaces', 'resolve-space-member-crm-tag', 'POST Resolve Space Member CRM Tag'],
  ['GET', '/spaces/{spaceSlug}/meta-settings', 'spaces', 'get-space-meta-settings', 'GET Get Space Meta Settings'],

  // ---- feeds: posts, comments, reactions, documents, moderation, scheduled posts
  ['GET', '/activities', 'feeds', 'list-activities', 'GET List Activities'],
  ['GET', '/comments/{comment_id}/reactions', 'feeds', 'list-comment-reactions', 'GET List Comment Reactions'],
  ['GET', '/comments/{id}', 'feeds', 'get-comment', 'GET Get Comment'],
  ['GET', '/documents', 'feeds', 'list-documents', 'GET List Documents'],
  ['POST', '/documents/delete', 'feeds', 'delete-document', 'POST Delete Document'],
  ['POST', '/documents/update', 'feeds', 'update-document', 'POST Update Document'],
  ['POST', '/documents/upload', 'feeds', 'upload-document', 'POST Upload Document'],
  ['GET', '/feeds', 'feeds', 'list-feeds', 'GET List Feeds'],
  ['POST', '/feeds', 'feeds', 'create-feed', 'POST Create Feed'],
  ['POST', '/feeds/batch', 'feeds', 'batch-create-feeds', 'POST Batch Create Feeds'],
  ['GET', '/feeds/bookmarks', 'feeds', 'list-bookmarked-feeds', 'GET List Bookmarked Feeds'],
  ['GET', '/feeds/links', 'feeds', 'list-feed-links', 'GET List Feed Links'],
  ['POST', '/feeds/links', 'feeds', 'create-feed-link', 'POST Create Feed Link'],
  ['POST', '/feeds/markdown-preview', 'feeds', 'preview-feed-markdown', 'POST Preview Feed Markdown'],
  ['POST', '/feeds/media-upload', 'feeds', 'upload-feed-media', 'POST Upload Feed Media'],
  ['GET', '/feeds/oembed', 'feeds', 'get-feed-oembed', 'GET Get Feed oEmbed'],
  ['GET', '/feeds/ticker', 'feeds', 'get-feed-ticker', 'GET Get Feed Ticker'],
  ['GET', '/feeds/ticker-updates', 'feeds', 'get-feed-ticker-updates', 'GET Get Feed Ticker Updates'],
  ['GET', '/feeds/welcome-banner', 'feeds', 'get-feed-welcome-banner', 'GET Get Feed Welcome Banner'],
  ['DELETE', '/feeds/{feed_id}', 'feeds', 'delete-feed', 'DELETE Delete Feed'],
  ['PATCH', '/feeds/{feed_id}', 'feeds', 'patch-feed', 'PATCH Patch Feed'],
  ['POST', '/feeds/{feed_id}', 'feeds', 'update-feed', 'POST Update Feed'],
  ['POST', '/feeds/{feed_id}/apps/survey-vote', 'feeds', 'vote-in-feed-survey', 'POST Vote In Feed Survey'],
  ['GET', '/feeds/{feed_id}/apps/survey-voters/{option_slug}', 'feeds', 'list-feed-survey-voters', 'GET List Feed Survey Voters'],
  ['GET', '/feeds/{feed_id}/by-id', 'feeds', 'get-feed-by-id', 'GET Get Feed By ID'],
  ['GET', '/feeds/{feed_id}/comments', 'feeds', 'list-feed-comments', 'GET List Feed Comments'],
  ['POST', '/feeds/{feed_id}/comments', 'feeds', 'create-feed-comment', 'POST Create Feed Comment'],
  ['DELETE', '/feeds/{feed_id}/comments/{comment_id}', 'feeds', 'delete-feed-comment', 'DELETE Delete Feed Comment'],
  ['PATCH', '/feeds/{feed_id}/comments/{comment_id}', 'feeds', 'patch-feed-comment', 'PATCH Patch Feed Comment'],
  ['POST', '/feeds/{feed_id}/comments/{comment_id}', 'feeds', 'update-feed-comment', 'POST Update Feed Comment'],
  ['POST', '/feeds/{feed_id}/comments/{comment_id}/reactions', 'feeds', 'react-to-feed-comment', 'POST React To Feed Comment'],
  ['DELETE', '/feeds/{feed_id}/media-preview', 'feeds', 'delete-feed-media-preview', 'DELETE Delete Feed Media Preview'],
  ['POST', '/feeds/{feed_id}/react', 'feeds', 'react-to-feed', 'POST React To Feed'],
  ['GET', '/feeds/{feed_id}/reactions', 'feeds', 'list-feed-reactions', 'GET List Feed Reactions'],
  ['POST', '/feeds/{feed_id}/reactions/toggle', 'feeds', 'toggle-feed-reaction', 'POST Toggle Feed Reaction'],
  ['GET', '/feeds/{feed_slug}/by-slug', 'feeds', 'get-feed-by-slug', 'GET Get Feed By Slug'],
  ['POST', '/fluent-player/audio-media/{media_id}', 'feeds', 'save-player-audio-media', 'POST Save Player Audio Media'],
  ['GET', '/fluent-player/video-content/{media_id}', 'feeds', 'get-player-video-content', 'GET Get Player Video Content'],
  ['POST', '/fluent-player/video-upload', 'feeds', 'upload-player-video', 'POST Upload Player Video'],
  ['POST', '/moderation/config', 'feeds', 'save-moderation-config', 'POST Save Moderation Config'],
  ['POST', '/moderation/report', 'feeds', 'report-content', 'POST Report Content'],
  ['GET', '/scheduled-posts', 'feeds', 'list-scheduled-posts', 'GET List Scheduled Posts'],
  ['POST', '/scheduled-posts/publish/{feed_id}', 'feeds', 'publish-scheduled-post', 'POST Publish Scheduled Post'],
  ['PUT', '/scheduled-posts/{feed_id}', 'feeds', 'update-scheduled-post', 'PUT Update Scheduled Post'],

  // ---- chat: chat threads, groups, messages
  ['GET', '/chat/broadcast/auth', 'chat', 'get-chat-broadcast-auth', 'GET Get Chat Broadcast Auth'],
  ['POST', '/chat/broadcast/auth', 'chat', 'save-chat-broadcast-auth', 'POST Save Chat Broadcast Auth'],
  ['POST', '/chat/groups', 'chat', 'create-chat-group', 'POST Create Chat Group'],
  ['POST', '/chat/groups/{thread_id}', 'chat', 'update-chat-group', 'POST Update Chat Group'],
  ['POST', '/chat/groups/{thread_id}/delete', 'chat', 'delete-chat-group', 'POST Delete Chat Group'],
  ['POST', '/chat/groups/{thread_id}/leave', 'chat', 'leave-chat-group', 'POST Leave Chat Group'],
  ['GET', '/chat/groups/{thread_id}/members', 'chat', 'list-chat-group-members', 'GET List Chat Group Members'],
  ['POST', '/chat/groups/{thread_id}/members', 'chat', 'add-chat-group-members', 'POST Add Chat Group Members'],
  ['POST', '/chat/groups/{thread_id}/members/{member_id}/admin', 'chat', 'promote-chat-group-member-to-admin', 'POST Promote Chat Group Member To Admin'],
  ['POST', '/chat/groups/{thread_id}/members/{member_id}/remove', 'chat', 'remove-chat-group-member', 'POST Remove Chat Group Member'],
  ['POST', '/chat/messages/delete/{message_id}', 'chat', 'delete-chat-message', 'POST Delete Chat Message'],
  ['POST', '/chat/messages/{message_id}/react', 'chat', 'react-to-chat-message', 'POST React To Chat Message'],
  ['GET', '/chat/messages/{thread_id}', 'chat', 'list-chat-messages', 'GET List Chat Messages'],
  ['POST', '/chat/messages/{thread_id}', 'chat', 'send-chat-message', 'POST Send Chat Message'],
  ['POST', '/chat/messages/{thread_id}/media_upload', 'chat', 'upload-chat-message-media', 'POST Upload Chat Message Media'],
  ['GET', '/chat/messages/{thread_id}/new', 'chat', 'list-new-chat-messages', 'GET List New Chat Messages'],
  ['POST', '/chat/read-threads', 'chat', 'mark-chat-threads-read', 'POST Mark Chat Threads Read'],
  ['GET', '/chat/threads', 'chat', 'list-chat-threads', 'GET List Chat Threads'],
  ['POST', '/chat/threads', 'chat', 'create-chat-thread', 'POST Create Chat Thread'],
  ['POST', '/chat/threads/block/{thread_id}', 'chat', 'block-chat-thread', 'POST Block Chat Thread'],
  ['POST', '/chat/threads/delete/{thread_id}', 'chat', 'delete-chat-thread', 'POST Delete Chat Thread'],
  ['POST', '/chat/threads/join/{thread_id}', 'chat', 'join-chat-thread', 'POST Join Chat Thread'],
  ['POST', '/chat/threads/leave/{thread_id}', 'chat', 'leave-chat-thread', 'POST Leave Chat Thread'],
  ['POST', '/chat/threads/unblock/{thread_id}', 'chat', 'unblock-chat-thread', 'POST Unblock Chat Thread'],
  ['GET', '/chat/threads/{thread_id}', 'chat', 'get-chat-thread', 'GET Get Chat Thread'],
  ['GET', '/chat/threads/{thread_id}/members', 'chat', 'list-chat-thread-members', 'GET List Chat Thread Members'],
  ['POST', '/chat/threads/{thread_id}/members/{member_id}/block-chat', 'chat', 'block-chat-thread-member', 'POST Block Chat Thread Member'],
  ['POST', '/chat/threads/{thread_id}/members/{member_id}/unblock-chat', 'chat', 'unblock-chat-thread-member', 'POST Unblock Chat Thread Member'],
  ['GET', '/chat/unread_threads', 'chat', 'list-unread-chat-threads', 'GET List Unread Chat Threads'],
  ['GET', '/chat/users', 'chat', 'list-chat-users', 'GET List Chat Users'],

  // ---- courses: courses, sections, lessons, students, quizzes
  ['GET', '/admin/all_space_courses', 'courses', 'list-all-space-courses', 'GET List All Space Courses'],
  ['GET', '/admin/courses', 'courses', 'list-managed-courses', 'GET List Managed Courses'],
  ['POST', '/admin/courses', 'courses', 'create-course', 'POST Create Course'],
  ['DELETE', '/admin/courses/{course_id}', 'courses', 'delete-course', 'DELETE Delete Course'],
  ['GET', '/admin/courses/{course_id}', 'courses', 'get-managed-course', 'GET Get Managed Course'],
  ['PUT', '/admin/courses/{course_id}', 'courses', 'update-course', 'PUT Update Course'],
  ['GET', '/admin/courses/{course_id}/comments', 'courses', 'list-course-comments', 'GET List Course Comments'],
  ['PUT', '/admin/courses/{course_id}/copy-section', 'courses', 'copy-course-section', 'PUT Copy Course Section'],
  ['POST', '/admin/courses/{course_id}/duplicate', 'courses', 'duplicate-course', 'POST Duplicate Course'],
  ['GET', '/admin/courses/{course_id}/export/quiz-results', 'courses', 'export-course-quiz-results', 'GET Export Course Quiz Results'],
  ['GET', '/admin/courses/{course_id}/export/students', 'courses', 'export-course-students', 'GET Export Course Students'],
  ['GET', '/admin/courses/{course_id}/instructors/search', 'courses', 'search-course-instructors', 'GET Search Course Instructors'],
  ['GET', '/admin/courses/{course_id}/lessons', 'courses', 'list-course-lessons', 'GET List Course Lessons'],
  ['POST', '/admin/courses/{course_id}/lessons', 'courses', 'create-course-lesson', 'POST Create Course Lesson'],
  ['DELETE', '/admin/courses/{course_id}/lessons/{lesson_id}', 'courses', 'delete-course-lesson', 'DELETE Delete Course Lesson'],
  ['GET', '/admin/courses/{course_id}/lessons/{lesson_id}', 'courses', 'get-course-lesson', 'GET Get Course Lesson'],
  ['PATCH', '/admin/courses/{course_id}/lessons/{lesson_id}', 'courses', 'patch-course-lesson', 'PATCH Patch Course Lesson'],
  ['PUT', '/admin/courses/{course_id}/lessons/{lesson_id}', 'courses', 'update-course-lesson', 'PUT Update Course Lesson'],
  ['POST', '/admin/courses/{course_id}/lessons/{lesson_id}/duplicate', 'courses', 'duplicate-course-lesson', 'POST Duplicate Course Lesson'],
  ['POST', '/admin/courses/{course_id}/links', 'courses', 'create-course-link', 'POST Create Course Link'],
  ['PUT', '/admin/courses/{course_id}/lockscreens', 'courses', 'update-course-lockscreen', 'PUT Update Course Lockscreen'],
  ['GET', '/admin/courses/{course_id}/meta-settings', 'courses', 'get-course-meta-settings', 'GET Get Course Meta Settings'],
  ['PUT', '/admin/courses/{course_id}/move-lesson', 'courses', 'move-course-lesson', 'PUT Move Course Lesson'],
  ['GET', '/admin/courses/{course_id}/quiz-results', 'courses', 'list-course-quiz-results', 'GET List Course Quiz Results'],
  ['POST', '/admin/courses/{course_id}/quiz-results/{quiz_id}', 'courses', 'save-course-quiz-result', 'POST Save Course Quiz Result'],
  ['GET', '/admin/courses/{course_id}/sections', 'courses', 'list-course-sections', 'GET List Course Sections'],
  ['POST', '/admin/courses/{course_id}/sections', 'courses', 'create-course-section', 'POST Create Course Section'],
  ['PATCH', '/admin/courses/{course_id}/sections/indexes', 'courses', 'reorder-course-sections', 'PATCH Reorder Course Sections'],
  ['DELETE', '/admin/courses/{course_id}/sections/{section_id}', 'courses', 'delete-course-section', 'DELETE Delete Course Section'],
  ['GET', '/admin/courses/{course_id}/sections/{section_id}', 'courses', 'get-course-section', 'GET Get Course Section'],
  ['PATCH', '/admin/courses/{course_id}/sections/{section_id}', 'courses', 'patch-course-section', 'PATCH Patch Course Section'],
  ['PUT', '/admin/courses/{course_id}/sections/{section_id}', 'courses', 'update-course-section', 'PUT Update Course Section'],
  ['PATCH', '/admin/courses/{course_id}/sections/{section_id}/indexes', 'courses', 'reorder-course-section-lessons', 'PATCH Reorder Course Section Lessons'],
  ['GET', '/admin/courses/{course_id}/students', 'courses', 'list-course-students', 'GET List Course Students'],
  ['POST', '/admin/courses/{course_id}/students', 'courses', 'add-course-student', 'POST Add Course Student'],
  ['POST', '/admin/courses/{course_id}/students/bulk-add', 'courses', 'bulk-add-course-students', 'POST Bulk Add Course Students'],
  ['POST', '/admin/courses/{course_id}/students/bulk-import', 'courses', 'bulk-import-course-students', 'POST Bulk Import Course Students'],
  ['POST', '/admin/courses/{course_id}/students/resolve-crm-tag', 'courses', 'resolve-course-student-crm-tag', 'POST Resolve Course Student CRM Tag'],
  ['DELETE', '/admin/courses/{course_id}/students/{student_id}', 'courses', 'delete-course-student', 'DELETE Delete Course Student'],
  ['DELETE', '/admin/courses/{course_id}/students/{student_id}/progress', 'courses', 'delete-student-course-progress', 'DELETE Delete Student Course Progress'],
  ['GET', '/admin/courses/{course_id}/users/search', 'courses', 'search-course-users', 'GET Search Course Users'],
  ['GET', '/admin/courses/{course_id}/welcome-banner', 'courses', 'get-course-welcome-banner', 'GET Get Course Welcome Banner'],
  ['POST', '/admin/courses/{course_id}/welcome-banner', 'courses', 'save-course-welcome-banner', 'POST Save Course Welcome Banner'],
  ['GET', '/courses', 'courses', 'list-courses', 'GET List Courses'],
  ['GET', '/courses/all-courses', 'courses', 'list-all-courses', 'GET List All Courses'],
  ['GET', '/courses/{course_id}', 'courses', 'get-course', 'GET Get Course'],
  ['POST', '/courses/{course_id}/enroll', 'courses', 'enroll-in-course', 'POST Enroll In Course'],
  ['PUT', '/courses/{course_id}/lessons/{lesson_id}/completion', 'courses', 'update-course-lesson-completion', 'PUT Update Course Lesson Completion'],
  ['GET', '/courses/{course_id}/lessons/{lesson_id}/quiz/result', 'courses', 'get-course-lesson-quiz-result', 'GET Get Course Lesson Quiz Result'],
  ['POST', '/courses/{course_id}/lessons/{lesson_id}/quiz/submit', 'courses', 'submit-course-lesson-quiz', 'POST Submit Course Lesson Quiz'],
  ['POST', '/courses/{course_id}/lessons/{lesson_id}/video-watched', 'courses', 'mark-course-lesson-video-watched', 'POST Mark Course Lesson Video Watched'],
  ['DELETE', '/courses/{course_id}/progress', 'courses', 'delete-my-course-progress', 'DELETE Delete My Course Progress'],
  ['GET', '/courses/{course_slug}/by-slug', 'courses', 'get-course-by-slug', 'GET Get Course By Slug'],
  ['GET', '/courses/{course_slug}/lessons/{lesson_slug}/by-slug', 'courses', 'get-course-lesson-by-slug', 'GET Get Course Lesson By Slug'],

  // ---- profile: profiles, members, follows, invitations, notifications, leaderboard
  ['GET', '/invitations', 'profile', 'list-invitations', 'GET List Invitations'],
  ['POST', '/invitations', 'profile', 'create-invitation', 'POST Create Invitation'],
  ['POST', '/invitations/link', 'profile', 'create-invitation-link', 'POST Create Invitation Link'],
  ['DELETE', '/invitations/{invitation_id}', 'profile', 'delete-invitation', 'DELETE Delete Invitation'],
  ['POST', '/invitations/{invitation_id}/resend', 'profile', 'resend-invitation', 'POST Resend Invitation'],
  ['GET', '/leaderboard', 'profile', 'get-leaderboard', 'GET Get Leaderboard'],
  ['GET', '/members', 'profile', 'list-members', 'GET List Members'],
  ['PATCH', '/members/{user_id}', 'profile', 'patch-member', 'PATCH Patch Member'],
  ['GET', '/notifications', 'profile', 'list-notifications', 'GET List Notifications'],
  ['POST', '/notifications/mark-all-read', 'profile', 'mark-all-notifications-read', 'POST Mark All Notifications Read'],
  ['POST', '/notifications/mark-read/{feed_id}/by-feed-id', 'profile', 'mark-notification-read-by-feed', 'POST Mark Notification Read By Feed'],
  ['POST', '/notifications/mark-read/{notification_id}', 'profile', 'mark-notification-read', 'POST Mark Notification Read'],
  ['GET', '/notifications/unread', 'profile', 'get-unread-notification-count', 'GET Get Unread Notification Count'],
  ['POST', '/profile/{userId}/toggle-follow', 'profile', 'toggle-profile-follow', 'POST Toggle Profile Follow'],
  ['GET', '/profile/{username}', 'profile', 'get-profile', 'GET Get Profile'],
  ['POST', '/profile/{username}', 'profile', 'save-profile', 'POST Save Profile'],
  ['PUT', '/profile/{username}', 'profile', 'update-profile', 'PUT Update Profile'],
  ['POST', '/profile/{username}/block', 'profile', 'block-profile', 'POST Block Profile'],
  ['GET', '/profile/{username}/blocked-users', 'profile', 'list-profile-blocked-users', 'GET List Profile Blocked Users'],
  ['POST', '/profile/{username}/change-password', 'profile', 'change-profile-password', 'POST Change Profile Password'],
  ['GET', '/profile/{username}/comments', 'profile', 'list-profile-comments', 'GET List Profile Comments'],
  ['GET', '/profile/{username}/courses', 'profile', 'list-profile-courses', 'GET List Profile Courses'],
  ['POST', '/profile/{username}/follow', 'profile', 'follow-profile', 'POST Follow Profile'],
  ['GET', '/profile/{username}/followers', 'profile', 'list-profile-followers', 'GET List Profile Followers'],
  ['GET', '/profile/{username}/followings', 'profile', 'list-profile-followings', 'GET List Profile Followings'],
  ['GET', '/profile/{username}/memberships', 'profile', 'list-profile-memberships', 'GET List Profile Memberships'],
  ['POST', '/profile/{username}/notification', 'profile', 'save-profile-notification', 'POST Save Profile Notification'],
  ['GET', '/profile/{username}/notification-preferences', 'profile', 'get-profile-notification-preferences', 'GET Get Profile Notification Preferences'],
  ['POST', '/profile/{username}/notification-preferences', 'profile', 'save-profile-notification-preferences', 'POST Save Profile Notification Preferences'],
  ['POST', '/profile/{username}/reconfirm-email', 'profile', 'reconfirm-profile-email', 'POST Reconfirm Profile Email'],
  ['GET', '/profile/{username}/spaces', 'profile', 'list-profile-spaces', 'GET List Profile Spaces'],
  ['POST', '/profile/{username}/unblock', 'profile', 'unblock-profile', 'POST Unblock Profile'],
  ['POST', '/profile/{username}/unfollow', 'profile', 'unfollow-profile', 'POST Unfollow Profile'],

  // ---- analytics: community analytics (read-only)
  ['GET', '/analytics/members/activity', 'analytics', 'get-analytics-member-activity', 'GET Get Analytics Member Activity'],
  ['GET', '/analytics/members/top-commenters', 'analytics', 'list-top-commenters', 'GET List Top Commenters'],
  ['GET', '/analytics/members/top-members', 'analytics', 'list-top-members', 'GET List Top Members'],
  ['GET', '/analytics/members/top-post-starters', 'analytics', 'list-top-post-starters', 'GET List Top Post Starters'],
  ['GET', '/analytics/members/widget', 'analytics', 'get-analytics-member-widget', 'GET Get Analytics Member Widget'],
  ['GET', '/analytics/overview/activity', 'analytics', 'get-analytics-overview-activity', 'GET Get Analytics Overview Activity'],
  ['GET', '/analytics/overview/popular-day-time', 'analytics', 'get-analytics-overview-popular-day-time', 'GET Get Analytics Overview Popular Day Time'],
  ['GET', '/analytics/overview/widget', 'analytics', 'get-analytics-overview-widget', 'GET Get Analytics Overview Widget'],
  ['GET', '/analytics/spaces/activity', 'analytics', 'get-analytics-space-activity', 'GET Get Analytics Space Activity'],
  ['GET', '/analytics/spaces/popular', 'analytics', 'get-analytics-space-popular', 'GET Get Analytics Space Popular'],
  ['GET', '/analytics/spaces/search', 'analytics', 'search-spaces-analytics', 'GET Search Spaces Analytics'],
  ['GET', '/analytics/spaces/widget', 'analytics', 'get-analytics-space-widget', 'GET Get Analytics Space Widget'],

  // ---- settings: portal settings and runtime options
  ['GET', '/options/app-vars', 'settings', 'get-app-vars', 'GET Get App Vars'],
  ['GET', '/options/menu-items', 'settings', 'list-menu-items', 'GET List Menu Items'],
  ['GET', '/options/sidebar-menu-html', 'settings', 'get-sidebar-menu-html', 'GET Get Sidebar Menu HTML'],
  ['GET', '/settings/color-config', 'settings', 'get-color-config', 'GET Get Color Config'],
  ['POST', '/settings/color-config', 'settings', 'save-color-config', 'POST Save Color Config'],
  ['GET', '/settings/crm-tagging-config', 'settings', 'get-crm-tagging-config', 'GET Get CRM Tagging Config'],
  ['POST', '/settings/crm-tagging-config', 'settings', 'save-crm-tagging-config', 'POST Save CRM Tagging Config'],
  ['GET', '/settings/customization-settings', 'settings', 'get-customization-settings', 'GET Get Customization Settings'],
  ['POST', '/settings/customization-settings', 'settings', 'save-customization-settings', 'POST Save Customization Settings'],
  ['GET', '/settings/features', 'settings', 'get-features', 'GET Get Features'],
  ['POST', '/settings/features', 'settings', 'save-features', 'POST Save Features'],
  ['GET', '/settings/fluent-player-settings', 'settings', 'get-fluent-player-settings', 'GET Get Fluent Player Settings'],
  ['POST', '/settings/fluent-player-settings', 'settings', 'save-fluent-player-settings', 'POST Save Fluent Player Settings'],
  ['GET', '/settings/followers/config', 'settings', 'get-followers-config', 'GET Get Followers Config'],
  ['POST', '/settings/followers/config', 'settings', 'save-followers-config', 'POST Save Followers Config'],
  ['POST', '/settings/install_plugin', 'settings', 'install-plugin', 'POST Install Plugin'],
  ['GET', '/settings/menu-settings', 'settings', 'get-menu-settings', 'GET Get Menu Settings'],
  ['POST', '/settings/menu-settings', 'settings', 'save-menu-settings', 'POST Save Menu Settings'],
  ['GET', '/settings/privacy-settings', 'settings', 'get-privacy-settings', 'GET Get Privacy Settings'],
  ['POST', '/settings/privacy-settings', 'settings', 'save-privacy-settings', 'POST Save Privacy Settings'],
  ['GET', '/settings/snippets-settings', 'settings', 'get-snippets-settings', 'GET Get Snippets Settings'],
  ['POST', '/settings/snippets-settings', 'settings', 'save-snippets-settings', 'POST Save Snippets Settings'],

  // ---- admin: site administration: license, managers, webhooks, topics, badges, onboarding, auth/email/push settings
  ['GET', '/admin/auth-settings', 'admin', 'get-auth-settings', 'GET Get Auth Settings'],
  ['POST', '/admin/auth-settings', 'admin', 'save-auth-settings', 'POST Save Auth Settings'],
  ['GET', '/admin/custom-profile-fields', 'admin', 'list-custom-profile-fields', 'GET List Custom Profile Fields'],
  ['POST', '/admin/custom-profile-fields', 'admin', 'save-custom-profile-fields', 'POST Save Custom Profile Fields'],
  ['GET', '/admin/email-settings', 'admin', 'get-email-settings', 'GET Get Email Settings'],
  ['POST', '/admin/email-settings', 'admin', 'save-email-settings', 'POST Save Email Settings'],
  ['GET', '/admin/general', 'admin', 'get-general-settings', 'GET Get General Settings'],
  ['POST', '/admin/general', 'admin', 'save-general-settings', 'POST Save General Settings'],
  ['GET', '/admin/leaderboards/levels', 'admin', 'list-leaderboard-levels', 'GET List Leaderboard Levels'],
  ['POST', '/admin/leaderboards/levels', 'admin', 'save-leaderboard-levels', 'POST Save Leaderboard Levels'],
  ['DELETE', '/admin/license', 'admin', 'deactivate-license', 'DELETE Deactivate License'],
  ['GET', '/admin/license', 'admin', 'get-license', 'GET Get License'],
  ['POST', '/admin/license', 'admin', 'activate-license', 'POST Activate License'],
  ['POST', '/admin/links', 'admin', 'create-link', 'POST Create Link'],
  ['DELETE', '/admin/links/{id}', 'admin', 'delete-link', 'DELETE Delete Link'],
  ['GET', '/admin/managers', 'admin', 'list-managers', 'GET List Managers'],
  ['POST', '/admin/managers', 'admin', 'add-manager', 'POST Add Manager'],
  ['DELETE', '/admin/managers/{user_id}', 'admin', 'delete-manager', 'DELETE Delete Manager'],
  ['GET', '/admin/messaging-setting', 'admin', 'get-messaging-settings', 'GET Get Messaging Settings'],
  ['POST', '/admin/messaging-setting', 'admin', 'save-messaging-settings', 'POST Save Messaging Settings'],
  ['GET', '/admin/on-boardings', 'admin', 'list-onboardings', 'GET List Onboardings'],
  ['POST', '/admin/on-boardings', 'admin', 'save-onboarding', 'POST Save Onboarding'],
  ['POST', '/admin/on-boardings/change-slug', 'admin', 'change-onboarding-slug', 'POST Change Onboarding Slug'],
  ['GET', '/admin/profile-link-providers', 'admin', 'list-profile-link-providers', 'GET List Profile Link Providers'],
  ['POST', '/admin/profile-link-providers', 'admin', 'save-profile-link-providers', 'POST Save Profile Link Providers'],
  ['GET', '/admin/push-settings', 'admin', 'get-push-settings', 'GET Get Push Settings'],
  ['POST', '/admin/push-settings', 'admin', 'save-push-settings', 'POST Save Push Settings'],
  ['GET', '/admin/pwa-settings', 'admin', 'get-pwa-settings', 'GET Get PWA Settings'],
  ['POST', '/admin/pwa-settings', 'admin', 'save-pwa-settings', 'POST Save PWA Settings'],
  ['GET', '/admin/storage-settings', 'admin', 'get-storage-settings', 'GET Get Storage Settings'],
  ['POST', '/admin/storage-settings', 'admin', 'save-storage-settings', 'POST Save Storage Settings'],
  ['GET', '/admin/topics', 'admin', 'list-topics', 'GET List Topics'],
  ['POST', '/admin/topics', 'admin', 'create-topic', 'POST Create Topic'],
  ['POST', '/admin/topics/config', 'admin', 'save-topics-config', 'POST Save Topics Config'],
  ['POST', '/admin/topics/reorder', 'admin', 'reorder-topics', 'POST Reorder Topics'],
  ['DELETE', '/admin/topics/{topic_id}', 'admin', 'delete-topic', 'DELETE Delete Topic'],
  ['GET', '/admin/user-badges', 'admin', 'list-user-badges', 'GET List User Badges'],
  ['POST', '/admin/user-badges', 'admin', 'save-user-badges', 'POST Save User Badges'],
  ['GET', '/admin/users', 'admin', 'list-community-users', 'GET List Community Users'],
  ['GET', '/admin/webhooks', 'admin', 'list-webhooks', 'GET List Webhooks'],
  ['POST', '/admin/webhooks', 'admin', 'create-webhook', 'POST Create Webhook'],
  ['DELETE', '/admin/webhooks/{id}', 'admin', 'delete-webhook', 'DELETE Delete Webhook'],
  ['GET', '/admin/welcome-banner', 'admin', 'get-welcome-banner', 'GET Get Welcome Banner'],
  ['POST', '/admin/welcome-banner', 'admin', 'save-welcome-banner', 'POST Save Welcome Banner'],];

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const siteArg = args.indexOf('--site');
const site = siteArg >= 0 ? args[siteArg + 1] : process.env.FLUENT_SITE_URL;

const key = (m, p) => `${m} ${p}`;
const table = new Map(OPS.map(([m, p]) => [key(m, p), true]));
if (OPS.length !== table.size) throw new Error('OPS table has duplicate method+path entries');
if (new Set(OPS.map(([, , g, s]) => `${g}/${s}`)).size !== OPS.length) {
  throw new Error('OPS table has duplicate group/slug pairs');
}

if (!offline) {
  if (!site) {
    console.error('No site to check against — pass --site https://… or set FLUENT_SITE_URL (or use --offline).');
    process.exit(1);
  }
  const res = await fetch(`${site.replace(/\/+$/, '')}/wp-json/${NAMESPACE}`);
  if (!res.ok) throw new Error(`route index fetch failed: HTTP ${res.status}`);
  const index = await res.json();
  const live = new Set();
  for (const [routePath, route] of Object.entries(index.routes ?? {})) {
    const rel = routePath.replace(`/${NAMESPACE}`, '');
    if (!rel) continue;
    const template = rel.replace(/\(\?P<(\w+)>(?:\[[^\]]*\]|[^)])*\)/g, '{$1}');
    for (const ep of route.endpoints ?? []) {
      for (const method of ep.methods ?? []) live.add(key(method, template));
    }
  }
  const missing = [...live].filter((k) => !table.has(k));
  const stale = [...table.keys()].filter((k) => !live.has(k));
  if (missing.length || stale.length) {
    for (const k of missing) console.error(`LIVE ROUTE NOT IN TABLE: ${k}`);
    for (const k of stale) console.error(`TABLE ENTRY NOT SERVED LIVE: ${k}`);
    console.error(`\n${missing.length} unmapped live route(s), ${stale.length} stale table entr(ies) — update OPS in this script.`);
    process.exit(1);
  }
  console.log(`live check ok — ${live.size} operations match the table`);
}

const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const today = new Date().toISOString().slice(0, 10);
const outDir = 'docs/api-reference/fluentcommunity';
fs.mkdirSync(outDir, { recursive: true });
const existing = fs.existsSync(`${outDir}/endpoints.json`)
  ? JSON.parse(fs.readFileSync(`${outDir}/endpoints.json`, 'utf8'))
  : undefined;

const inventory = {
  product: 'fluentcommunity',
  source: 'live REST route index (GET /wp-json/fluent-community/v2) — FluentCommunity publishes no REST API reference',
  scraped: today,
  baseUrl: `https://{website}/wp-json/${NAMESPACE}`,
  namespace: NAMESPACE,
  count: OPS.length,
  endpoints: OPS.map(([method, path, group, slug, summary]) => ({
    group,
    slug,
    operationId: camel(slug),
    method,
    path,
    summary,
    security: ['ApplicationPasswords'],
    deprecated: false,
  })),
};
const unchanged =
  existing && JSON.stringify({ ...existing, scraped: '' }) === JSON.stringify({ ...inventory, scraped: '' });
if (unchanged) {
  console.log(`${outDir}/endpoints.json unchanged (${OPS.length} operations) — not restamped`);
} else {
  fs.writeFileSync(`${outDir}/endpoints.json`, JSON.stringify(inventory, null, 2) + '\n');
  console.log(`${outDir}/endpoints.json written (${OPS.length} operations)`);
}

const groups = [...new Set(OPS.map(([, , g]) => g))];
const lines = [
  '# FluentCommunity REST API reference',
  '',
  '**Generated** by `scripts/gen-fluentcommunity-docs.mjs` — do not edit by hand.',
  '',
  'FluentCommunity publishes no REST API reference, so this inventory is captured',
  `from the live route index (\`GET /wp-json/${NAMESPACE}\`) and curated here.`,
  'Request/response body shapes are not documented upstream: they mirror what the',
  'community portal sends, so read a record first (`detail:"full"`) and mirror its shape.',
  '',
  `- Base URL: \`https://{website}/wp-json/${NAMESPACE}\``,
  '- Auth: WordPress Application Passwords over HTTP Basic (capability-checked,',
  '  like the other products; see [`api-reference/auth.md`](../auth.md)).',
  '- Many routes are **member-context**: they act as the authenticated user',
  '  (posting to a feed, joining a space, sending a chat message, enrolling in a',
  '  course). Calls made with an admin application password act as that admin',
  '  user, and their output is visible to the community.',
  '',
];
for (const g of groups) {
  lines.push(`## ${g}`, '', '| Method | Path | Summary |', '|---|---|---|');
  for (const [method, path, group, , summary] of OPS) {
    if (group === g) lines.push(`| ${method} | \`${path}\` | ${summary.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/, '')} |`);
  }
  lines.push('');
}
fs.writeFileSync('docs/api-reference/fluentcommunity.md', lines.join('\n'));
console.log('docs/api-reference/fluentcommunity.md written');
