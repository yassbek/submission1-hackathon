# MatchFoundry

**AI-Powered Community Skill Matching for Startup Incubators**

## Product Story

MatchFoundry helps early-stage founders overcome their biggest challenges by connecting them with peers who have just solved similar problems. When a founder struggles with customer discovery, our AI instantly finds another founder who just completed their first 20 user interviews. Within minutes, they're scheduling a 30-minute coffee chat to share hard-won insights.

The platform transforms isolated struggles into community learning moments, making peer support instant, relevant, and effortless.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  Next.js 15 App Router + React 19 + TailwindCSS 4          │
│  - Founder view (submit needs, view matches, schedule)      │
│  - Expert view (respond to requests, propose times)         │
│  - Admin dashboard (community metrics)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ REST API
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  /api/checkin              - Submit weekly updates          │
│  /api/extract_needs_learnings - AI extraction (OpenAI)      │
│  /api/compute_matches      - AI matching algorithm          │
│  /api/chats                - Coffee chat scheduling         │
│  /api/admin/overview       - Analytics dashboard            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Prisma ORM
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  Users, Needs, Learnings, MatchSuggestions, CoffeeChats    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      MCP Server                              │
│  Model Context Protocol tools for AI assistants:            │
│  - extract_needs_learnings                                   │
│  - compute_matches                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     OpenAI Integration                       │
│  GPT-4.1-mini with structured JSON output                   │
│  Extracts 1-3 needs + 1-3 learnings from free text         │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS 4
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL with Prisma ORM v6.19
- **AI**: OpenAI GPT-4.1-mini (structured outputs)
- **MCP**: Model Context Protocol SDK v1.22
- **Validation**: Zod v3.25

## Database Schema

### Core Models
- **User**: Profiles with roles (founder, expert, admin)
- **Need**: Help requests with categories (product, sales, fundraising, etc.)
- **Learning**: Skills/experiences to share
- **MatchSuggestion**: AI-generated matches with confidence scores
- **CoffeeChat**: Scheduled 30-min sessions with status tracking
- **ProposedSlot**: Time slot proposals for scheduling

### Key Features
- Active/inactive flags for temporal data
- Status enums for workflow management
- Proper foreign key relationships
- Transaction support for data consistency

## MCP Tools Defined

### 1. `extract_needs_learnings`
**Purpose**: Parse free-text weekly check-ins into structured data

**Input**:
```json
{
  "text": "This week I launched my MVP and got 50 signups! But I'm struggling with defining my ICP and need help with customer segmentation."
}
```

**Output**:
```json
{
  "needs": [
    { "label": "Help defining ideal customer profile (ICP)", "category": "product" },
    { "label": "Customer segmentation strategy", "category": "sales" }
  ],
  "learnings": [
    { "label": "Launched MVP and acquired first 50 users", "category": "product" }
  ]
}
```

**Implementation**:
- Primary: OpenAI GPT-4.1-mini with JSON schema enforcement
- Fallback: Heuristic keyword matching
- Auto-assigns 1 of 9 categories per item

### 2. `compute_matches`
**Purpose**: Generate AI-powered matches between needs and learnings

**Input**: `{}` (reads from database)

**Output**:
```json
[
  {
    "need_id": "clx123abc",
    "expert_user_id": "cly456def",
    "score": 0.85,
    "reason": "Same theme: product. Both mention 'customer interviews' and 'user feedback'"
  }
]
```

**Algorithm**:
1. Load all active needs and learnings
2. Tokenize and remove stopwords
3. Compute keyword overlap similarity
4. Boost score by 0.3 for category match
5. Filter minimum threshold (0.2)
6. Return top 3 matches per need

**Future Enhancement**: Replace with OpenAI embeddings for semantic similarity (cosine distance on vector embeddings)

## How AI Assisted Development

### Areas Where AI Accelerated Development (Estimated 40% time savings)

1. **Database Schema Design**
   - Generated initial Prisma schema with relationships
   - Suggested enum values for categories and statuses
   - Recommended indexes for query optimization

2. **Boilerplate API Routes**
   - Generated Next.js API route structure
   - Created TypeScript interfaces for request/response
   - Implemented error handling patterns

3. **UI Component Generation**
   - Built initial React components with Tailwind styling
   - Generated responsive layouts
   - Created state management hooks

4. **Algorithm Implementation**
   - Helped design tokenization and similarity scoring logic
   - Suggested optimization strategies
   - Debugged edge cases in matching algorithm

5. **Type Safety**
   - Generated TypeScript types from Prisma schema
   - Added Zod validation schemas
   - Fixed type errors across the codebase

### Human Decisions & Creative Work

- **Product vision** and user flow design
- **UX decisions** (three-column kanban, role switcher)
- **Data modeling choices** (active/inactive pattern, status workflows)
- **AI prompt engineering** for extraction quality
- **Code review** and refactoring for maintainability
- **Architecture decisions** (serverless vs. traditional backend)

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Installation

1. **Clone and install dependencies**
```bash
git clone <your-repo-url>
cd founder-match
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add:
# DATABASE_URL="postgresql://user:password@localhost:5432/founder_match"
# OPENAI_API_KEY="sk-..."
```

3. **Set up database**
```bash
npx prisma migrate dev
npx prisma db seed
```

4. **Run development server**
```bash
npm run dev
# Open http://localhost:3000
```

5. **Run MCP server** (optional, for AI assistant integration)
```bash
npm run mcp:server
```

### Test Users (from seed data)
- **Founder**: Alice (alice@example.com)
- **Expert**: Bob (bob@example.com)
- **Admin**: Carla (carla@admin.com)

Use the user switcher dropdown in the header to test different roles.

## GCP Deployment (Production-Ready Plan)

### Services to Use

1. **Cloud Run** - Host Next.js application
   - Serverless, auto-scaling
   - Dockerfile: `FROM node:18-alpine`
   - Build with `npm run build`

2. **Cloud SQL for PostgreSQL** - Production database
   - Managed PostgreSQL 14
   - Automatic backups
   - Connection via Cloud SQL Proxy

3. **Secret Manager** - Secure API keys
   - Store `OPENAI_API_KEY`
   - Inject at runtime

4. **Cloud Build** - CI/CD pipeline
   - Trigger on git push
   - Run migrations before deploy

### Deployment Commands
```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/matchfoundry

# Deploy to Cloud Run
gcloud run deploy matchfoundry \
  --image gcr.io/PROJECT_ID/matchfoundry \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances PROJECT_ID:us-central1:matchfoundry-db \
  --set-secrets OPENAI_API_KEY=openai-key:latest
```

## Key Features Implemented

### Core Functionality
✅ **Authentication System** - NextAuth.js with email/password
✅ Weekly check-in submission with free-text input
✅ AI extraction of needs and learnings (1-3 each)
✅ Manual editing before save
✅ Category assignment (9 categories)
✅ AI-powered matching with confidence scores
✅ Human-readable match reasons
✅ Coffee chat request flow
✅ **Real Date/Time Picker** - Expert time slot proposal with DatePicker UI
✅ Founder slot selection
✅ **Jitsi Meeting Integration** - Real video chat links (meet.jit.si)
✅ Admin dashboard with metrics
✅ MCP server with 2 tools

### User Experience
✅ **Login/Register Pages** - Secure authentication flow
✅ Role-based views (founder/expert/admin)
✅ Clean, modern UI with Tailwind
✅ Three-column scheduling kanban
✅ **Interactive Time Selection Modal** - Visual date/time picker
✅ **Join Meeting Button** - One-click Jitsi video chat access
✅ Category badges with visual distinction
✅ Empty states throughout
✅ Loading states for async operations

## Future Enhancements

### High Priority
- ✅ ~~**Authentication**: NextAuth.js with email/password~~ **COMPLETED**
- **Semantic Matching**: OpenAI embeddings instead of token overlap
- ✅ ~~**Real Meeting Links**: Jitsi integration~~ **COMPLETED**
- **Email Notifications**: SendGrid for match alerts
- **User Profiles**: Bio, photo, startup details
- **Session Management**: Protected routes and role-based access

### Nice to Have
- **Advanced Scheduling**: Drag-and-drop calendar view
- **Analytics Dashboard**: Weekly trends, engagement metrics
- **Gamification**: XP points, streak tracking
- **Search & Filter**: Find specific skills/needs
- **Mobile App**: React Native version

## License

MIT

## Contact

Built for Hackathon 2025

---

**Note**: This is a functional prototype demonstrating the core matchmaking engine. Authentication and production security features are required before public deployment.
