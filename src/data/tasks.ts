export type Category = { id: string; name: string; short: string; tasks: string[] };

export const CATEGORIES: Category[] = [
  {
    "id": "daily",
    "name": "Daily Tasks",
    "short": "Daily",
    "tasks": []
  },
  {
    "id": "weekly",
    "name": "Weekly Tasks",
    "short": "Weekly",
    "tasks": []
  },
  {
    "id": "monthly",
    "name": "Monthly Tasks",
    "short": "Monthly",
    "tasks": []
  },
  {
    "id": "seasonal",
    "name": "Rare Tasks(maybe a couple times a season)",
    "short": "Seasonal",
    "tasks": []
  }
];
