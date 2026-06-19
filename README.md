# FlowMind AI — Natural Language AI Workflow Builder

Create production-ready AI workflows with natural language. Describe your automation tasks and our AI engine generates interactive nodes and coordinates multi-step agent actions.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui, Lucide Icons, Recharts
- **Workflow Canvas:** @xyflow/react (React Flow)
- **Database:** MongoDB Atlas (via Mongoose)

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster (or local MongoDB)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

> **Windows PowerShell Users:** If you get a "running scripts is disabled" error, either:
> - Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` in an Admin PowerShell, **OR**
> - Use `cmd /c npm install` instead.

### 2. Set Up Environment Variables

Copy the example env file and fill in your MongoDB connection string:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and replace the placeholder with your actual MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/flowmind-ai?retryWrites=true&w=majority
```

> **Tip:** You can get your connection string from the MongoDB Atlas dashboard:
> **Cluster → Connect → Drivers → Copy connection string**

### 3. Run the Development Server

```bash
npm run dev
```

> **Windows PowerShell Users:** Use `cmd /c npm run dev` if you see script errors.

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   ├── (dashboard)/        # Dashboard route group
│   │   ├── layout.tsx      # Dashboard layout with Sidebar
│   │   ├── dashboard/      # Main dashboard page
│   │   ├── workflows/      # Workflows list page
│   │   ├── profile/        # User profile page
│   │   └── ...
│   └── api/                # API routes
│       ├── workflows/      # Workflow CRUD endpoints
│       └── executions/     # Execution log endpoints
├── components/             # Reusable UI components
│   ├── Sidebar.tsx         # Collapsible sidebar navigation
│   ├── DashboardCharts.tsx # Analytics chart component
│   ├── WorkflowsList.tsx   # Workflows list with search
│   └── ui/                 # shadcn/ui primitives
├── models/                 # Mongoose schemas
│   ├── User.ts
│   ├── Workflow.ts
│   └── Execution.ts
└── lib/                    # Utility modules
    ├── db.ts               # MongoDB connection helper
    └── utils.ts            # General utilities
```

## Notes

- **Authentication** is currently disabled (using a mock user). Clerk integration can be re-added later.
- The app works even without a database connection — the dashboard will show empty/mock data and log connection errors to the console.
