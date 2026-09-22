=== All-In-One MCP for Fluent Suite ===
Version: {{VERSION}}
License: MIT
Homepage: https://upfluent.io
Source and issues: https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity

Connect Claude to FluentCRM, FluentCart, Fluent Forms, FluentCommunity and
WP Social Ninja on your WordPress site: every documented REST endpoint as an
individual tool, with confirm gates on every destructive operation.

FREE FOR A LIMITED TIME. This build is being given away during the
early-access period. It will not stay free forever -- a paid license is
planned once early access ends. The copy you have downloaded is yours to
keep and keeps working.

== What is in this download ==

fluentmcp-{{VERSION}}.mcpb   Claude Desktop extension (drag-and-drop install)
readme.txt                   This file
LICENSE.txt                  MIT license

== Install (Claude Desktop, about two minutes) ==

1. In WordPress: Users -> your admin user -> Application Passwords ->
   Add New. Copy the generated password. (Use a dedicated admin user with
   only the Fluent products' manager roles if you can; you can revoke it
   in one click.)
2. In Claude Desktop: Settings -> Extensions -> drag the .mcpb file into
   the window.
3. Fill in the form: your site URL (the root, e.g. https://example.com),
   the WordPress username, and the Application Password.
4. Ask Claude: "Run verify_setup." It checks the connection and reports
   which Fluent products it found.

Products you do not have installed are simply switched off.

== If something goes wrong ==

Reproduce the problem once, then ask Claude:

  "Run support_report and show me the full output unchanged."

Copy the whole block it prints into a new issue at the repository link
above (or into your support message). It contains the server version, the
connection checks and the recent errors, with your site address, username,
password and any email addresses masked.

== Other clients (Claude Code, Cursor, claude.ai on web/mobile) ==

Those installs use the source repository instead of this extension:
https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity#install

== Safety ==

Every hard-to-undo tool (deletes, refunds, cancels, mass sends, plugin
installs, permission changes) refuses to run without confirm: true, and
twelve catastrophic operations are locked outright. Keep Claude Desktop on
"Allow once" for writes. Full details: the Safety and Disclaimer sections
of the README at the repository link above.

== Changelog ==

See CHANGELOG.md in the repository for the full history.

== Disclaimer ==

Independent community project. Not associated with, endorsed by or
supported by WPManageNinja. FluentCRM, FluentCart, Fluent Forms,
FluentCommunity and WP Social Ninja are trademarks of their owners. Use at
your own risk; see the MIT license for the warranty and liability terms.
