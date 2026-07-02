import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  PackageCheck,
  Boxes,
  Package,
  ShoppingCart,
  Settings,
  User as UserIcon,
  LogOut,
  Bell,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import type { ReactNode } from "react";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function getNav(role: "Company" | "Supplier"): NavSection[] {
  if (role === "Supplier") {
    return [
      {
        label: "Supplier",
        items: [
          { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
          { title: "Items", url: "/items", icon: Package },
          { title: "Orders", url: "/orders", icon: ShoppingCart },
        ],
      },
      {
        label: "Account",
        items: [
          { title: "Profile", url: "/profile", icon: UserIcon },
          { title: "Settings", url: "/settings", icon: Settings },
        ],
      },
    ];
  }
  return [
    {
      label: "Company",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Suppliers", url: "/suppliers", icon: Truck },
        { title: "Purchase Orders", url: "/purchase-orders", icon: ClipboardList },
        { title: "Arrivals", url: "/arrivals", icon: PackageCheck },
        { title: "Inventory", url: "/inventory", icon: Boxes },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Profile", url: "/profile", icon: UserIcon },
        { title: "Settings", url: "/settings", icon: Settings },
      ],
    },
  ];
}

function BrandMark() {
  const { state } = useSidebar();
  return (
    <div className="flex items-center gap-2.5 px-2 py-1">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <span className="text-sm font-bold tracking-tight">P</span>
      </div>
      {state !== "collapsed" && (
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">
            POES
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            Purchase & Inventory
          </div>
        </div>
      )}
    </div>
  );
}

function AppSidebar() {
  const { user } = useAuth();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const role = user?.role ?? "Company";
  const sections = useMemo(() => getNav(role), [role]);

  const isActive = (url: string) =>
    currentPath === url || currentPath.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <BrandMark />
      </SidebarHeader>
      <SidebarContent className="gap-1">
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-primary-soft data-[active=true]:text-primary-soft-foreground data-[active=true]:font-medium"
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-[11px] text-muted-foreground/70">
          v1.0 · {role}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-lg"
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </Button>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 rounded-lg pl-1.5 pr-2.5"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <div className="max-w-[160px] truncate text-xs font-medium leading-tight">
              {user?.email}
            </div>
            <div className="text-[10px] leading-tight text-muted-foreground">
              {user?.role}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-xs font-medium">{user?.email}</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            Signed in as {user?.role}
            {user?.supplierCode ? ` · ${user.supplierCode}` : ""}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
          <UserIcon className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Breadcrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex"
    >
      <Link to="/dashboard" className="hover:text-foreground">
        Home
      </Link>
      {segments.map((seg, i) => {
        const to = "/" + segments.slice(0, i + 1).join("/");
        const label = seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
        const last = i === segments.length - 1;
        return (
          <span key={to} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 opacity-60" />
            {last ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={to} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="rounded-lg" />
            <div className="hidden h-4 w-px bg-border md:block" />
            <Breadcrumbs />
            <div className="ml-auto flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative rounded-lg"
              >
                <Bell className="h-[18px] w-[18px]" />
                <Badge
                  variant="secondary"
                  className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full border-2 border-background bg-primary p-0 text-[9px] text-primary-foreground"
                >
                  0
                </Badge>
              </Button>
              <ThemeToggle />
              <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
              <UserMenu />
            </div>
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
