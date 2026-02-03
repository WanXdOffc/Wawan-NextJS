## Project Summary
Wanyzx Portfolio & Tools platform is a personal website featuring a collection of AI-powered tools, project showcases, and a full-stack digital experience. It includes an advanced AI Chatbot (Wanyzx AI), a Web Parser/Scraper, and various utility tools.

## Tech Stack
- **Frontend**: Next.js 15.5.7 (App Router), Tailwind CSS, Framer Motion, Lucide React, Sonner (Notifications).
- **Backend**: Next.js API Routes, Node.js.
- **Database**: MongoDB (Mongoose).
- **AI Integration**: Gemini API, Gemmy AI (Custom wrapper for Vision, File Reading, and Image Generation).

## Architecture
- `src/app/features/wanyzx-ai`: Standalone AI Chat page with session history and API key management.
- `src/app/tools/web-parser`: AI-powered web scraper with auto-testing capabilities.
- `src/lib/models`: Mongoose schemas for API keys, chat sessions, and website data.
- `src/components/MainLayout`: Conditional layout management (hides header/footer for specific routes like Wanyzx AI).
- `src/lib/gemmy.ts`: Core AI integration service.

## User Preferences
- Use `sonner` for all notifications (toasts).
- Modern, distinctive frontend aesthetics with high-impact motion and typography.
- Strictly adhere to security rules regarding sensitive data (secrets, keys).

## Project Guidelines
- **API Integration**: Always use `Web_Search` before implementing third-party services.
- **Styling**: Consistent use of CSS variables and cohesive themes.
- **Wanyzx AI Identity**: Context-aware assistant, never leaks secrets, uses refusal format "I'm sorry, I can’t help with that request because it involves restricted or sensitive information."
- **Web Parser**: Must pass auto-tests in sandbox before showing code/data to user.

## Common Patterns
- **API Responses**: Standardized JSON format `{ success: boolean, data?: any, error?: string }`.
- **UI Components**: Shadcn UI components customized with glassmorphism and gradient accents.