import {
  LayoutDashboard,
  UserPlus,
  Users,
  ClipboardCheck,
  ChartNoAxesCombined,
  CalendarCheck,
  BookOpen,
  CircleHelp,
  Bell,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", path: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Students",
    items: [
      { title: "Admissions", path: "/admin/admissions", icon: UserPlus },
      { title: "Class Manager", path: "/admin/students", icon: Users },
    ],
  },
  {
    label: "Academics",
    items: [
      { title: "Results", path: "/admin/results", icon: ClipboardCheck },
      {
        title: "Analytics",
        path: "/admin/analytics",
        icon: ChartNoAxesCombined,
      },
      { title: "Attendance", path: "/admin/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Study Materials", path: "/admin/materials", icon: BookOpen },
      { title: "Quizzes", path: "/admin/quizzes", icon: CircleHelp },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Notifications", path: "/admin/notifications", icon: Bell },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", path: "/admin/settings", icon: Settings }],
  },
];
