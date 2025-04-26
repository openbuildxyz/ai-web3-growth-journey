# 0xAuto Mock-up Plan - Phase 1: Core Application Structure

**Goal:** Establish the core application structure including navigation and basic page layouts for Agents, Store, Dashboard, and Settings, focusing on layout and component placement.

**Technology Stack:**
*   Framework: Next.js
*   Styling: Tailwind CSS + daisyUI
*   AI Components: `@ant-design/x` (as visual placeholders initially)
*   Language: TypeScript

**Overall Plan:**
1.  Project Initialization & Setup
2.  Core Layout Structure (Navbar, Sidebar)
3.  Page Creation & Basic Content:
    *   Agents Page (Card Layout)
    *   Store Page
    *   Dashboard Page
    *   Settings Page
4.  Styling and Theming
5.  Refine Page Content with Mock Data/Placeholders

---

## Core Application Structure

1.  **Overall Structure:**
    *   Utilize a shared `Layout` component (`src/components/Layout.tsx`) containing the Navbar and Sidebar Drawer.
    *   Individual pages will render within this layout.

2.  **Navbar (Top - Part of `Layout.tsx`):**
    *   **Left:** Logo/Application Name ("0xAuto").
    *   **Right:**
        *   Placeholder for "Points Balance" (e.g., "Points: 1,234").
        *   User Profile / Wallet Connect Button: Use a daisyUI `dropdown dropdown-end` containing mock options like "Profile", "Settings", "Logout".

3.  **Sidebar (Left - Part of `Layout.tsx`, using daisyUI `Drawer` and `Menu`):**
    *   **Menu Items:**
        *   `<li><a>Agents</a></li>`
        *   `<li><a>Store</a></li>`
        *   `<li><a>Dashboard</a></li>`
        *   `<li><a>Setting</a></li>`
    *   Active state should be visually indicated based on the current route.

4.  **Page Implementations (Static Mock-ups):**

    *   **Agents Page (`src/app/agents/page.tsx`):**
        *   **Layout:** Use a grid layout (Tailwind CSS Grid) to display Agent cards.
        *   **Header:** `<h1>My Agents</h1>`, `<button class="btn btn-primary">Create New Agent</button>`.
        *   **Agent Card Component (Placeholder):**
            *   A daisyUI `card` containing:
                *   Agent Name (e.g., "Agent Alpha")
                *   Status Indicator (e.g., `<span class="badge badge-success badge-sm">Running</span>`)
                *   Brief description or Trigger Type.
                *   Action buttons (e.g., "Configure", "Logs").
            *   Clicking the card should eventually navigate to a detailed configuration page (not implemented in this phase).
        *   Display 3-4 mock agent cards.

    *   **Store Page (`src/app/store/page.tsx`):**
        *   **Layout:** Similar grid or list layout for showcasing public Agents/MCPs.
        *   **Header:** `<h1>Store</h1>`.
        *   **Content:** Placeholder cards/list items for:
            *   Public Agents (e.g., "Community Weather Agent") with "Add to My Agents" button.
            *   Available MCP Services (e.g., "Playwright MCP", "Unsplash MCP") with details/links.

    *   **Dashboard Page (`src/app/dashboard/page.tsx`):**
        *   **Layout:** Use cards or sections to display key metrics.
        *   **Header:** `<h1>Dashboard</h1>`.
        *   **Content Sections (Placeholders):**
            *   Card: "Today's API Calls" (e.g., "150 Calls").
            *   Card: "Points Consumed Today" (e.g., "75 Points").
            *   Section/Table: "Top Agents by Calls (Today)" (e.g., "Agent Beta - 50 calls", "Agent Gamma - 40 calls").

    *   **Setting Page (`src/app/setting/page.tsx`):**
        *   **Layout:** Use sections or forms for different settings.
        *   **Header:** `<h1>Settings</h1>`.
        *   **Content Sections (Placeholders):**
            *   **Account:** Username (display), Change Password button/form.
            *   **Billing:** Current Points (display), Recharge button, Auto-recharge toggle/settings.
            *   **Session:** Logout button.

5.  **Styling:** Primarily use daisyUI components and themes, supplemented by Tailwind utility classes for layout and fine-tuning.

---

**Next Steps:** Implement the changes in the code, starting with `Layout.tsx` for the sidebar, then creating the new page files and basic structures.