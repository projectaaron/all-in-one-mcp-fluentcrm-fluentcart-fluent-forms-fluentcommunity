=== All-In-One MCP for Fluent Suite ===
Version: {{VERSION}}
License: MIT
Homepage: https://upfluent.io
Support: https://upfluent.io/support/  (or email support@upfluent.io)
Source and issues: https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity

Connect Claude to FluentCRM, FluentCart, Fluent Forms, FluentCommunity and
WP Social Ninja on your WordPress site: every documented REST endpoint as an
individual tool, with confirm gates on every destructive operation.

FREE FOR A LIMITED TIME. This build is being given away during the
early-access period. It will not stay free forever -- a paid license is
planned once early access ends. The copy you have downloaded is yours to
keep and keeps working.

== What is in this download ==

- fluentmcp-{{VERSION}}.mcpb -- the Claude Desktop extension
- readme.txt -- this file
- LICENSE.txt -- the MIT license

== Before you start ==

- Nothing else to install: Claude Desktop (current version, macOS or
  Windows) runs the extension with its own built-in Node.js.
- Your site must use https:// (WordPress only offers Application
  Passwords over HTTPS).

== Install (Claude Desktop, about two minutes) ==

1. In WordPress go to Users -> Profile, scroll to Application Passwords,
   type a name such as "Claude", click Add New Application Password, and
   copy the password shown (it is shown once; the spaces are fine).
   If you can, create a separate WordPress user just for this, give it
   only the Fluent permissions it needs, and create the password on that
   user -- you can revoke it in one click.
2. In Claude Desktop open Settings -> Extensions, drag the .mcpb file into
   the window, and click Install.
3. Fill in the form: your site URL including https:// (the home page
   address, e.g. https://example.com -- not the /wp-admin address), your
   WordPress username, and the Application Password.
4. Start a new chat and ask Claude: "Run verify_setup." You should see a
   check mark next to each Fluent plugin you have. Plugins you don't have
   show as not_installed and are simply skipped.

== If something goes wrong ==

Reproduce the problem once, then ask Claude:

  "Run support_report and show me the full output unchanged."

Send the whole block it prints to https://upfluent.io/support/ or
support@upfluent.io (or open an issue at the repository link above). It
contains the server version, the connection checks and the recent errors,
with your site address, username, password and any email addresses masked.

Common fixes:
- No "Application Passwords" section on your profile: the site must use
  https://, and a security plugin or your host may have turned them off
  (in Wordfence: Login Security -> Settings -> uncheck "Disable WordPress
  application passwords").
- Every product fails: check the site URL includes https://, and that
  Settings -> Permalinks is not set to "Plain".

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
