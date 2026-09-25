# onCall — Senior Care Staffing & Recruitment

_We care for you_

onCall is a staffing and recruiting agency focused on matching qualified caregivers, nurses, and support staff with senior care providers and families. This repository contains the Next.js frontend for the onCall website — a responsive marketing site with pages for services, careers, contact, and client/staff requests.

## Highlights

- 🚀 Built with Next.js 15 (App Router)
- 🎨 Tailwind CSS for utility-first styling
- 💻 TypeScript for type safety
- 📱 Responsive, accessible components
- 🧭 Clear content structure for staffing/recruiting workflows

## Pages (what to expect)

- **Home** (`/`) — Landing page with overview, services, and call-to-action for clients and candidates
- **About** (`/about`) — onCall mission, values, and team
- **Services** (`/services`) — Staffing solutions (temporary, long-term, credentialed nurses, carers)
- **Careers** (`/careers`) — Job listings and application flow for candidates
- **Contact** (`/contact`) — Contact form and agency details
- **Request Staff** (`/request-staff`) — Form for facilities or families to request staffing support

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open your browser at http://localhost:3000

## Project structure (high level)

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── about/
│   ├── careers/
│   ├── contact/
│   ├── request-staff/      # Request staff / client intake form
│   ├── layout.tsx
│   └── page.tsx            # Home page
├── components/             # Reusable React components (Header, Footer, Forms)
├── styles/                 # Global and utility CSS
└── public/                 # Static assets (images, fonts)
```

## Customization

- Update agency copy, contact info, and job postings in the components and pages under `src/app`.
- Tailwind classes are used throughout; customize `tailwind.config.ts` for brand colors.
- Replace images in `public/images/` to reflect your brand.

## Workflows and content tips

- Services should list role types (e.g., Certified Nursing Assistant, Registered Nurse, Caregiver) and highlight certifications and vetting process.
- Careers page should link to an application form that captures CV, certifications, availability, and references.

## Dependencies

Core dependencies used by this frontend:

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS

Other libraries used in the project may include animation, charting, or form helpers depending on pages implemented.

## Build for production

```bash
npm run build
npm start
```

## Notes

- This repo was originally adapted from a marketing template; content and assets have been repurposed for onCall. If you are using third-party template assets, please verify licensing before commercial use.

If you'd like, I can also:

- Rename the repo/package metadata to match `onCall` (package.json) and update site metadata files.
- Add a short CONTRIBUTING.md or CODE_OF_CONDUCT for hiring/candidate contributors.

---
Updated README to reflect onCall branding and staffing/recruiting focus.

## Fresh PostgreSQL installation

Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_DATABASE through private configuration. Run `npm run db:migrate` to apply the complete committed migration chain. A database with existing tables but no Drizzle ledger is rejected and needs a reviewed baseline; never run the historical destructive migrations against unreviewed legacy data.

For an empty installation, run `npm run db:initialize` with INITIALIZE_DATABASE exactly matching DB_DATABASE, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME and a privately generated INITIAL_ADMIN_PASSWORD of at least 24 characters. The initializer never replaces an existing administrator. Remove initialization-only values afterward. It sends no messages and adds no customer or demo records.

Provide a strong private JWT_SECRET before deployment. The web admin-registration endpoint requires an existing active administrator. Temporary public data-repair endpoints return 410 and cannot modify records. Production uses port 3060 with the current npm start command.
