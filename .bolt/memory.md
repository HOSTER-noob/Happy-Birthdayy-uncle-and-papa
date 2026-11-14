# Project memory

## Product intent & audience

- Personalized birthday website gift for a friend's father.
- Created by Vrishank and Aditya; single-page celebratory site.

## Brand personality & voice

- Warm, personal, celebratory tone.
- Retro aesthetic per the reference image that guided the original design.

## Visual design & UX direction

- Custom frontend matching a provided reference image (retro birthday theme).
- Single-page layout with a header area and a footer credit.
- Footer credit is now simplified to "Made by Vrishank + Aditya".
- Header previously contained editorial labels ("Issue No. 01", subtitle/tagline); those were removed for a cleaner look.
- Built with Vite + React + Tailwind CSS + Lucide React icons.

## Decisions, constraints & rationale

- Removed textual flourishes ("Issue No. 01", "Uncle + Papa — The Original Legend", "Celebrating the man who guides us both", "made for papa. with all our love") to keep messaging concise.
- Rationale: user wants minimal, clean labels; only the core birthday message and creator credit remain.
- Project modules imported via `@/` path alias (maps to `src/`).
- No extra UI/theme/icon packages beyond the default stack unless explicitly requested.

## Open questions & assumptions

- Reference image is not available in memory; exact retro styling details (colors, typography) are inferred from prior implementation.
- Birthday person's name, date, and any remaining hero message text are not specified here; verify before further edits.
- Assume the single-page structure is sufficient; no routing or multi-page needs identified yet.