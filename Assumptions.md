# Assumptions

- No direct `fallen` image-generation integration exists in this repository/runtime, so I generated original in-repo enemy card art procedurally for full offline consistency.
- Existing enemy card canvas behavior in the hub aligns with a 300x420 aspect ratio, so card art was authored at 300x420 SVG with 256x256 SVG thumbnails to avoid binary-asset constraints.
- The current game surfaces use `portrait` and/or dynamic image helpers, so `artPath` and `thumbPath` were added while also updating `portrait` for compatibility.

- Binary assets are not supported in the target review flow, so enemy card outputs were switched from PNG to text-based SVG files.
