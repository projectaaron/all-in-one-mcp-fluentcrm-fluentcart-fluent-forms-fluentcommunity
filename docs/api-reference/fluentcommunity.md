# FluentCommunity REST API reference

**Generated** by `scripts/gen-fluentcommunity-docs.mjs` — do not edit by hand.

FluentCommunity publishes no REST API reference, so this inventory is captured
from the live route index (`GET /wp-json/fluent-community/v2`) and curated here.
Request/response body shapes are not documented upstream: they mirror what the
community portal sends, so read a record first (`detail:"full"`) and mirror its shape.

- Base URL: `https://{website}/wp-json/fluent-community/v2`
- Auth: WordPress Application Passwords over HTTP Basic (capability-checked,
  like the other products; see [`api-reference/auth.md`](../auth.md)).
- Many routes are **member-context**: they act as the authenticated user
  (posting to a feed, joining a space, sending a chat message, enrolling in a
  course). Calls made with an admin application password act as that admin
  user, and their output is visible to the community.

## spaces

| Method | Path | Summary |
|---|---|---|
| POST | `/cart/products/create` | Create Cart Product |
| GET | `/cart/products/search` | Search Cart Products |
| DELETE | `/cart/spaces/{spaceId}/paywalls` | Delete Space Paywall |
| GET | `/cart/spaces/{spaceId}/paywalls` | List Space Paywalls |
| POST | `/cart/spaces/{spaceId}/paywalls` | Create Space Paywall |
| GET | `/media-gallery/{spaceSlug}` | Get Space Media Gallery |
| GET | `/spaces` | List Spaces |
| POST | `/spaces` | Create Space |
| GET | `/spaces/all-spaces` | List All Spaces |
| GET | `/spaces/discover` | List Discoverable Spaces |
| GET | `/spaces/space_groups` | List Space Groups |
| POST | `/spaces/space_groups` | Create Space Group |
| PATCH | `/spaces/space_groups/move-space` | Move Space To Group |
| PATCH | `/spaces/space_groups/re-index` | Reindex Space Groups |
| PATCH | `/spaces/space_groups/re-index-spaces` | Reindex Spaces In Groups |
| DELETE | `/spaces/space_groups/{id}` | Delete Space Group |
| PUT | `/spaces/space_groups/{id}` | Update Space Group |
| GET | `/spaces/users/search` | Search Space Users |
| DELETE | `/spaces/{spaceId}/by-id` | Delete Space By ID |
| PUT | `/spaces/{spaceId}/by-id` | Update Space By ID |
| DELETE | `/spaces/{spaceSlug}` | Delete Space By Slug |
| GET | `/spaces/{spaceSlug}/by-slug` | Get Space By Slug |
| PUT | `/spaces/{spaceSlug}/by-slug` | Update Space By Slug |
| POST | `/spaces/{spaceSlug}/join` | Join Space |
| POST | `/spaces/{spaceSlug}/leave` | Leave Space |
| POST | `/spaces/{spaceSlug}/links` | Create Space Link |
| GET | `/spaces/{spaceSlug}/lockscreens` | Get Space Lockscreens |
| PUT | `/spaces/{spaceSlug}/lockscreens` | Update Space Lockscreens |
| GET | `/spaces/{spaceSlug}/members` | List Space Members |
| POST | `/spaces/{spaceSlug}/members` | Add Space Member |
| POST | `/spaces/{spaceSlug}/members/bulk-add` | Bulk Add Space Members |
| POST | `/spaces/{spaceSlug}/members/bulk-import` | Bulk Import Space Members |
| POST | `/spaces/{spaceSlug}/members/remove` | Remove Space Member |
| POST | `/spaces/{spaceSlug}/members/resolve-crm-tag` | Resolve Space Member CRM Tag |
| GET | `/spaces/{spaceSlug}/meta-settings` | Get Space Meta Settings |

## feeds

| Method | Path | Summary |
|---|---|---|
| GET | `/activities` | List Activities |
| GET | `/comments/{comment_id}/reactions` | List Comment Reactions |
| GET | `/comments/{id}` | Get Comment |
| GET | `/documents` | List Documents |
| POST | `/documents/delete` | Delete Document |
| POST | `/documents/update` | Update Document |
| POST | `/documents/upload` | Upload Document |
| GET | `/feeds` | List Feeds |
| POST | `/feeds` | Create Feed |
| POST | `/feeds/batch` | Batch Create Feeds |
| GET | `/feeds/bookmarks` | List Bookmarked Feeds |
| GET | `/feeds/links` | List Feed Links |
| POST | `/feeds/links` | Create Feed Link |
| POST | `/feeds/markdown-preview` | Preview Feed Markdown |
| POST | `/feeds/media-upload` | Upload Feed Media |
| GET | `/feeds/oembed` | Get Feed oEmbed |
| GET | `/feeds/ticker` | Get Feed Ticker |
| GET | `/feeds/ticker-updates` | Get Feed Ticker Updates |
| GET | `/feeds/welcome-banner` | Get Feed Welcome Banner |
| DELETE | `/feeds/{feed_id}` | Delete Feed |
| PATCH | `/feeds/{feed_id}` | Patch Feed |
| POST | `/feeds/{feed_id}` | Update Feed |
| POST | `/feeds/{feed_id}/apps/survey-vote` | Vote In Feed Survey |
| GET | `/feeds/{feed_id}/apps/survey-voters/{option_slug}` | List Feed Survey Voters |
| GET | `/feeds/{feed_id}/by-id` | Get Feed By ID |
| GET | `/feeds/{feed_id}/comments` | List Feed Comments |
| POST | `/feeds/{feed_id}/comments` | Create Feed Comment |
| DELETE | `/feeds/{feed_id}/comments/{comment_id}` | Delete Feed Comment |
| PATCH | `/feeds/{feed_id}/comments/{comment_id}` | Patch Feed Comment |
| POST | `/feeds/{feed_id}/comments/{comment_id}` | Update Feed Comment |
| POST | `/feeds/{feed_id}/comments/{comment_id}/reactions` | React To Feed Comment |
| DELETE | `/feeds/{feed_id}/media-preview` | Delete Feed Media Preview |
| POST | `/feeds/{feed_id}/react` | React To Feed |
| GET | `/feeds/{feed_id}/reactions` | List Feed Reactions |
| POST | `/feeds/{feed_id}/reactions/toggle` | Toggle Feed Reaction |
| GET | `/feeds/{feed_slug}/by-slug` | Get Feed By Slug |
| POST | `/fluent-player/audio-media/{media_id}` | Save Player Audio Media |
| GET | `/fluent-player/video-content/{media_id}` | Get Player Video Content |
| POST | `/fluent-player/video-upload` | Upload Player Video |
| POST | `/moderation/config` | Save Moderation Config |
| POST | `/moderation/report` | Report Content |
| GET | `/scheduled-posts` | List Scheduled Posts |
| POST | `/scheduled-posts/publish/{feed_id}` | Publish Scheduled Post |
| PUT | `/scheduled-posts/{feed_id}` | Update Scheduled Post |

## chat

| Method | Path | Summary |
|---|---|---|
| GET | `/chat/broadcast/auth` | Get Chat Broadcast Auth |
| POST | `/chat/broadcast/auth` | Save Chat Broadcast Auth |
| POST | `/chat/groups` | Create Chat Group |
| POST | `/chat/groups/{thread_id}` | Update Chat Group |
| POST | `/chat/groups/{thread_id}/delete` | Delete Chat Group |
| POST | `/chat/groups/{thread_id}/leave` | Leave Chat Group |
| GET | `/chat/groups/{thread_id}/members` | List Chat Group Members |
| POST | `/chat/groups/{thread_id}/members` | Add Chat Group Members |
| POST | `/chat/groups/{thread_id}/members/{member_id}/admin` | Promote Chat Group Member To Admin |
| POST | `/chat/groups/{thread_id}/members/{member_id}/remove` | Remove Chat Group Member |
| POST | `/chat/messages/delete/{message_id}` | Delete Chat Message |
| POST | `/chat/messages/{message_id}/react` | React To Chat Message |
| GET | `/chat/messages/{thread_id}` | List Chat Messages |
| POST | `/chat/messages/{thread_id}` | Send Chat Message |
| POST | `/chat/messages/{thread_id}/media_upload` | Upload Chat Message Media |
| GET | `/chat/messages/{thread_id}/new` | List New Chat Messages |
| POST | `/chat/read-threads` | Mark Chat Threads Read |
| GET | `/chat/threads` | List Chat Threads |
| POST | `/chat/threads` | Create Chat Thread |
| POST | `/chat/threads/block/{thread_id}` | Block Chat Thread |
| POST | `/chat/threads/delete/{thread_id}` | Delete Chat Thread |
| POST | `/chat/threads/join/{thread_id}` | Join Chat Thread |
| POST | `/chat/threads/leave/{thread_id}` | Leave Chat Thread |
| POST | `/chat/threads/unblock/{thread_id}` | Unblock Chat Thread |
| GET | `/chat/threads/{thread_id}` | Get Chat Thread |
| GET | `/chat/threads/{thread_id}/members` | List Chat Thread Members |
| POST | `/chat/threads/{thread_id}/members/{member_id}/block-chat` | Block Chat Thread Member |
| POST | `/chat/threads/{thread_id}/members/{member_id}/unblock-chat` | Unblock Chat Thread Member |
| GET | `/chat/unread_threads` | List Unread Chat Threads |
| GET | `/chat/users` | List Chat Users |

## courses

| Method | Path | Summary |
|---|---|---|
| GET | `/admin/all_space_courses` | List All Space Courses |
| GET | `/admin/courses` | List Managed Courses |
| POST | `/admin/courses` | Create Course |
| DELETE | `/admin/courses/{course_id}` | Delete Course |
| GET | `/admin/courses/{course_id}` | Get Managed Course |
| PUT | `/admin/courses/{course_id}` | Update Course |
| GET | `/admin/courses/{course_id}/comments` | List Course Comments |
| PUT | `/admin/courses/{course_id}/copy-section` | Copy Course Section |
| POST | `/admin/courses/{course_id}/duplicate` | Duplicate Course |
| GET | `/admin/courses/{course_id}/export/quiz-results` | Export Course Quiz Results |
| GET | `/admin/courses/{course_id}/export/students` | Export Course Students |
| GET | `/admin/courses/{course_id}/instructors/search` | Search Course Instructors |
| GET | `/admin/courses/{course_id}/lessons` | List Course Lessons |
| POST | `/admin/courses/{course_id}/lessons` | Create Course Lesson |
| DELETE | `/admin/courses/{course_id}/lessons/{lesson_id}` | Delete Course Lesson |
| GET | `/admin/courses/{course_id}/lessons/{lesson_id}` | Get Course Lesson |
| PATCH | `/admin/courses/{course_id}/lessons/{lesson_id}` | Patch Course Lesson |
| PUT | `/admin/courses/{course_id}/lessons/{lesson_id}` | Update Course Lesson |
| POST | `/admin/courses/{course_id}/lessons/{lesson_id}/duplicate` | Duplicate Course Lesson |
| POST | `/admin/courses/{course_id}/links` | Create Course Link |
| PUT | `/admin/courses/{course_id}/lockscreens` | Update Course Lockscreen |
| GET | `/admin/courses/{course_id}/meta-settings` | Get Course Meta Settings |
| PUT | `/admin/courses/{course_id}/move-lesson` | Move Course Lesson |
| GET | `/admin/courses/{course_id}/quiz-results` | List Course Quiz Results |
| POST | `/admin/courses/{course_id}/quiz-results/{quiz_id}` | Save Course Quiz Result |
| GET | `/admin/courses/{course_id}/sections` | List Course Sections |
| POST | `/admin/courses/{course_id}/sections` | Create Course Section |
| PATCH | `/admin/courses/{course_id}/sections/indexes` | Reorder Course Sections |
| DELETE | `/admin/courses/{course_id}/sections/{section_id}` | Delete Course Section |
| GET | `/admin/courses/{course_id}/sections/{section_id}` | Get Course Section |
| PATCH | `/admin/courses/{course_id}/sections/{section_id}` | Patch Course Section |
| PUT | `/admin/courses/{course_id}/sections/{section_id}` | Update Course Section |
| PATCH | `/admin/courses/{course_id}/sections/{section_id}/indexes` | Reorder Course Section Lessons |
| GET | `/admin/courses/{course_id}/students` | List Course Students |
| POST | `/admin/courses/{course_id}/students` | Add Course Student |
| POST | `/admin/courses/{course_id}/students/bulk-add` | Bulk Add Course Students |
| POST | `/admin/courses/{course_id}/students/bulk-import` | Bulk Import Course Students |
| POST | `/admin/courses/{course_id}/students/resolve-crm-tag` | Resolve Course Student CRM Tag |
| DELETE | `/admin/courses/{course_id}/students/{student_id}` | Delete Course Student |
| DELETE | `/admin/courses/{course_id}/students/{student_id}/progress` | Delete Student Course Progress |
| GET | `/admin/courses/{course_id}/users/search` | Search Course Users |
| GET | `/admin/courses/{course_id}/welcome-banner` | Get Course Welcome Banner |
| POST | `/admin/courses/{course_id}/welcome-banner` | Save Course Welcome Banner |
| GET | `/courses` | List Courses |
| GET | `/courses/all-courses` | List All Courses |
| GET | `/courses/{course_id}` | Get Course |
| POST | `/courses/{course_id}/enroll` | Enroll In Course |
| PUT | `/courses/{course_id}/lessons/{lesson_id}/completion` | Update Course Lesson Completion |
| GET | `/courses/{course_id}/lessons/{lesson_id}/quiz/result` | Get Course Lesson Quiz Result |
| POST | `/courses/{course_id}/lessons/{lesson_id}/quiz/submit` | Submit Course Lesson Quiz |
| POST | `/courses/{course_id}/lessons/{lesson_id}/video-watched` | Mark Course Lesson Video Watched |
| DELETE | `/courses/{course_id}/progress` | Delete My Course Progress |
| GET | `/courses/{course_slug}/by-slug` | Get Course By Slug |
| GET | `/courses/{course_slug}/lessons/{lesson_slug}/by-slug` | Get Course Lesson By Slug |

## profile

| Method | Path | Summary |
|---|---|---|
| GET | `/invitations` | List Invitations |
| POST | `/invitations` | Create Invitation |
| POST | `/invitations/link` | Create Invitation Link |
| DELETE | `/invitations/{invitation_id}` | Delete Invitation |
| POST | `/invitations/{invitation_id}/resend` | Resend Invitation |
| GET | `/leaderboard` | Get Leaderboard |
| GET | `/members` | List Members |
| PATCH | `/members/{user_id}` | Patch Member |
| GET | `/notifications` | List Notifications |
| POST | `/notifications/mark-all-read` | Mark All Notifications Read |
| POST | `/notifications/mark-read/{feed_id}/by-feed-id` | Mark Notification Read By Feed |
| POST | `/notifications/mark-read/{notification_id}` | Mark Notification Read |
| GET | `/notifications/unread` | Get Unread Notification Count |
| POST | `/profile/{userId}/toggle-follow` | Toggle Profile Follow |
| GET | `/profile/{username}` | Get Profile |
| POST | `/profile/{username}` | Save Profile |
| PUT | `/profile/{username}` | Update Profile |
| POST | `/profile/{username}/block` | Block Profile |
| GET | `/profile/{username}/blocked-users` | List Profile Blocked Users |
| POST | `/profile/{username}/change-password` | Change Profile Password |
| GET | `/profile/{username}/comments` | List Profile Comments |
| GET | `/profile/{username}/courses` | List Profile Courses |
| POST | `/profile/{username}/follow` | Follow Profile |
| GET | `/profile/{username}/followers` | List Profile Followers |
| GET | `/profile/{username}/followings` | List Profile Followings |
| GET | `/profile/{username}/memberships` | List Profile Memberships |
| POST | `/profile/{username}/notification` | Save Profile Notification |
| GET | `/profile/{username}/notification-preferences` | Get Profile Notification Preferences |
| POST | `/profile/{username}/notification-preferences` | Save Profile Notification Preferences |
| POST | `/profile/{username}/reconfirm-email` | Reconfirm Profile Email |
| GET | `/profile/{username}/spaces` | List Profile Spaces |
| POST | `/profile/{username}/unblock` | Unblock Profile |
| POST | `/profile/{username}/unfollow` | Unfollow Profile |

## analytics

| Method | Path | Summary |
|---|---|---|
| GET | `/analytics/members/activity` | Get Analytics Member Activity |
| GET | `/analytics/members/top-commenters` | List Top Commenters |
| GET | `/analytics/members/top-members` | List Top Members |
| GET | `/analytics/members/top-post-starters` | List Top Post Starters |
| GET | `/analytics/members/widget` | Get Analytics Member Widget |
| GET | `/analytics/overview/activity` | Get Analytics Overview Activity |
| GET | `/analytics/overview/popular-day-time` | Get Analytics Overview Popular Day Time |
| GET | `/analytics/overview/widget` | Get Analytics Overview Widget |
| GET | `/analytics/spaces/activity` | Get Analytics Space Activity |
| GET | `/analytics/spaces/popular` | Get Analytics Space Popular |
| GET | `/analytics/spaces/search` | Search Spaces Analytics |
| GET | `/analytics/spaces/widget` | Get Analytics Space Widget |

## settings

| Method | Path | Summary |
|---|---|---|
| GET | `/options/app-vars` | Get App Vars |
| GET | `/options/menu-items` | List Menu Items |
| GET | `/options/sidebar-menu-html` | Get Sidebar Menu HTML |
| GET | `/settings/color-config` | Get Color Config |
| POST | `/settings/color-config` | Save Color Config |
| GET | `/settings/crm-tagging-config` | Get CRM Tagging Config |
| POST | `/settings/crm-tagging-config` | Save CRM Tagging Config |
| GET | `/settings/customization-settings` | Get Customization Settings |
| POST | `/settings/customization-settings` | Save Customization Settings |
| GET | `/settings/features` | Get Features |
| POST | `/settings/features` | Save Features |
| GET | `/settings/fluent-player-settings` | Get Fluent Player Settings |
| POST | `/settings/fluent-player-settings` | Save Fluent Player Settings |
| GET | `/settings/followers/config` | Get Followers Config |
| POST | `/settings/followers/config` | Save Followers Config |
| POST | `/settings/install_plugin` | Install Plugin |
| GET | `/settings/menu-settings` | Get Menu Settings |
| POST | `/settings/menu-settings` | Save Menu Settings |
| GET | `/settings/privacy-settings` | Get Privacy Settings |
| POST | `/settings/privacy-settings` | Save Privacy Settings |
| GET | `/settings/snippets-settings` | Get Snippets Settings |
| POST | `/settings/snippets-settings` | Save Snippets Settings |

## admin

| Method | Path | Summary |
|---|---|---|
| GET | `/admin/auth-settings` | Get Auth Settings |
| POST | `/admin/auth-settings` | Save Auth Settings |
| GET | `/admin/custom-profile-fields` | List Custom Profile Fields |
| POST | `/admin/custom-profile-fields` | Save Custom Profile Fields |
| GET | `/admin/email-settings` | Get Email Settings |
| POST | `/admin/email-settings` | Save Email Settings |
| GET | `/admin/general` | Get General Settings |
| POST | `/admin/general` | Save General Settings |
| GET | `/admin/leaderboards/levels` | List Leaderboard Levels |
| POST | `/admin/leaderboards/levels` | Save Leaderboard Levels |
| DELETE | `/admin/license` | Deactivate License |
| GET | `/admin/license` | Get License |
| POST | `/admin/license` | Activate License |
| POST | `/admin/links` | Create Link |
| DELETE | `/admin/links/{id}` | Delete Link |
| GET | `/admin/managers` | List Managers |
| POST | `/admin/managers` | Add Manager |
| DELETE | `/admin/managers/{user_id}` | Delete Manager |
| GET | `/admin/messaging-setting` | Get Messaging Settings |
| POST | `/admin/messaging-setting` | Save Messaging Settings |
| GET | `/admin/on-boardings` | List Onboardings |
| POST | `/admin/on-boardings` | Save Onboarding |
| POST | `/admin/on-boardings/change-slug` | Change Onboarding Slug |
| GET | `/admin/profile-link-providers` | List Profile Link Providers |
| POST | `/admin/profile-link-providers` | Save Profile Link Providers |
| GET | `/admin/push-settings` | Get Push Settings |
| POST | `/admin/push-settings` | Save Push Settings |
| GET | `/admin/pwa-settings` | Get PWA Settings |
| POST | `/admin/pwa-settings` | Save PWA Settings |
| GET | `/admin/storage-settings` | Get Storage Settings |
| POST | `/admin/storage-settings` | Save Storage Settings |
| GET | `/admin/topics` | List Topics |
| POST | `/admin/topics` | Create Topic |
| POST | `/admin/topics/config` | Save Topics Config |
| POST | `/admin/topics/reorder` | Reorder Topics |
| DELETE | `/admin/topics/{topic_id}` | Delete Topic |
| GET | `/admin/user-badges` | List User Badges |
| POST | `/admin/user-badges` | Save User Badges |
| GET | `/admin/users` | List Community Users |
| GET | `/admin/webhooks` | List Webhooks |
| POST | `/admin/webhooks` | Create Webhook |
| DELETE | `/admin/webhooks/{id}` | Delete Webhook |
| GET | `/admin/welcome-banner` | Get Welcome Banner |
| POST | `/admin/welcome-banner` | Save Welcome Banner |
