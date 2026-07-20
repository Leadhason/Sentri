# Sentri Project Behavioral Rules

## Rule: Unified Cumulative Shore-Up Log
- **File Location**: All shore-up items must be logged in a single, unified file located at the workspace root: `/home/leadhason/Projects/sentri/SHORE_UP.md`.
- **Incremental Appending**: After every coding, development, or build session, do NOT create a new file or overwrite the entire file. Instead, append new "shore-up" items (covering placeholders, security configuration steps, missing third-party SDKs, or property configuration parameters needed for the newly built features) to the bottom of the existing `SHORE_UP.md` file.
- **Session Grouping**: Group the appended items clearly by date and feature name, preserving historical entries.
