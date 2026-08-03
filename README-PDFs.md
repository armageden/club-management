# Generated PDF Documentation

## Overview

This directory contains professional PDF documentation for the Hackathon Operations Hub database schema.

## Generated Files

### 1. EER Diagram (Entity-Relationship Diagram)
- **File:** `eer-diagram.pdf`
- **Size:** 914 KB
- **Source:** `schema.svg`
- **Description:** Visual EER diagram showing all 28 database tables organized across 10 modules, including:
  - All entity boxes with primary keys and attributes
  - Foreign key relationships with arrows
  - Cardinality indicators (1:1, 1:N, M:N)
  - Junction tables for many-to-many relationships
  - Cross-module relationships
  - Color-coded module groupings
  - Legend and statistics

**Style:** Blueprint aesthetic with dark background, cyan accents, and professional technical styling.

### 2. Schema Documentation
- **File:** `schema-documentation.pdf`
- **Size:** 584 KB
- **Source:** `schema-documentation.html`
- **Description:** Comprehensive written documentation including:
  - Cover page with database statistics
  - Table of contents
  - Detailed table definitions for all 28 tables
  - Column specifications with types and constraints
  - CHECK constraint definitions
  - Foreign key relationship details
  - Entity relationship summary
  - Technical notes and best practices

**Style:** Professional document with blue/white color scheme, clean tables, and clear typography.

## Database Statistics

- **Total Tables:** 28
- **Modules:** 10
- **Junction Tables:** 7
- **Database System:** PostgreSQL
- **Architecture:** Raw SQL (No ORM)

## Module Breakdown

| Module | Tables | Description |
|--------|--------|-------------|
| 1. Users & Profiles | 4 | User accounts, profiles, skills, and user-skill mappings |
| 2. Team Formation | 3 | Team requests, teams, and team membership |
| 3. Hardware Inventory | 3 | Equipment tracking, checkouts, and damage reports |
| 4. Schedule & Check-in | 2 | Event sessions and attendance tracking |
| 5. Finance | 3 | Sponsors, contributions, and expenses |
| 6. Certificates | 2 | Certificate rules and issued certificates |
| 7. Venue & Logistics | 2 | Venue areas and booking management |
| 8. Projects & Judging | 3 | Projects, submissions, and judging scores |
| 9. Volunteer Shifts | 2 | Volunteer shifts and assignments |
| 10. Incidents & Feedback | 6 | Incident management and feedback collection |

## Usage

### For Development
- Use `eer-diagram.pdf` for visual reference during development
- Use `schema-documentation.pdf` for detailed column specifications
- Both documents are synchronized with the `ARCHITECTURE.md` source

### For Presentations
- EER diagram is suitable for technical presentations and architecture reviews
- Schema documentation is suitable for stakeholder meetings and documentation

### For Onboarding
- New team members can use these documents to understand the database structure
- Visual diagram helps with quick comprehension
- Written documentation provides complete reference details

## Source Files

- **EER Diagram Source:** `schema.svg` (editable SVG)
- **Schema Documentation Source:** `schema-documentation.md` (Markdown) and `schema-documentation.html` (HTML)
- **Database Specification:** `ARCHITECTURE.md` (lines 449-813)

## Regenerating PDFs

To regenerate these PDFs after changes:

### EER Diagram
```bash
# If SVG is updated
rsvg-convert -f pdf -o eer-diagram.pdf schema.svg
```

### Schema Documentation
```bash
# Edit schema-documentation.md or schema-documentation.html first
chromium --headless --disable-gpu --print-to-pdf=schema-documentation.pdf --no-sandbox schema-documentation.html
```

## Quality Notes

- Both PDFs are print-ready with proper page breaks
- EER diagram uses vector graphics for infinite zoom capability
- Schema documentation includes proper typography and table formatting
- Colors are optimized for both screen viewing and printing
- Both documents include version information and timestamps

---

*Generated: August 3, 2026*
*Source: ARCHITECTURE.md - Hackathon Operations Hub*
