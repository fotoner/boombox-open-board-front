import { css } from "@emotion/react";

export const globalStyles = css`
  :root {
    --background: #ffffff;
    --foreground: #0a0a0a;
    --card: #ffffff;
    --card-foreground: #0a0a0a;
    --popover: #ffffff;
    --popover-foreground: #0a0a0a;
    --primary: #171717;
    --primary-foreground: #fafafa;
    --secondary: #f5f5f5;
    --secondary-foreground: #171717;
    --muted: #f5f5f5;
    --muted-foreground: #737373;
    --accent: #f5f5f5;
    --accent-foreground: #171717;
    --destructive: #ef4444;
    --destructive-foreground: #fafafa;
    --border: #e5e5e5;
    --input: #e5e5e5;
    --ring: #0a0a0a;
    --chart-1: #f97316;
    --chart-2: #0d9488;
    --chart-3: #1e293b;
    --chart-4: #eab308;
    --chart-5: #f97316;
    --radius: 0.5rem;
    --sidebar-background: #fafafa;
    --sidebar-foreground: #404040;
    --sidebar-primary: #1a1a1a;
    --sidebar-primary-foreground: #fafafa;
    --sidebar-accent: #f5f5f5;
    --sidebar-accent-foreground: #1a1a1a;
    --sidebar-border: #e5e5e5;
    --sidebar-ring: #3b82f6;
  }

  .dark {
    --background: #0a0a0a;
    --foreground: #fafafa;
    --card: #0a0a0a;
    --card-foreground: #fafafa;
    --popover: #0a0a0a;
    --popover-foreground: #fafafa;
    --primary: #fafafa;
    --primary-foreground: #171717;
    --secondary: #262626;
    --secondary-foreground: #fafafa;
    --muted: #262626;
    --muted-foreground: #a3a3a3;
    --accent: #262626;
    --accent-foreground: #fafafa;
    --destructive: #7f1d1d;
    --destructive-foreground: #fafafa;
    --border: #262626;
    --input: #262626;
    --ring: #d4d4d4;
    --chart-1: #3b82f6;
    --chart-2: #10b981;
    --chart-3: #f59e0b;
    --chart-4: #8b5cf6;
    --chart-5: #ec4899;
    --sidebar-background: #1a1a1a;
    --sidebar-foreground: #f5f5f5;
    --sidebar-primary: #3b82f6;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #262626;
    --sidebar-accent-foreground: #f5f5f5;
    --sidebar-border: #262626;
    --sidebar-ring: #3b82f6;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    font-family: Arial, Helvetica, sans-serif;
    background-color: var(--background);
    color: var(--foreground);
  }

  .text-balance {
    text-wrap: balance;
  }
`;
