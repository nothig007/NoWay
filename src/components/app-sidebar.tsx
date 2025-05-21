"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { House, Target, Keyboard, FolderCode, FolderUp, ChartNoAxesCombined, Bolt, Settings } from "lucide-react"
import { usePathname } from "next/navigation";
import { NavUser } from "./nav-user";
import { NavMain } from "@/components/nav-main"
const data= {
    user : {
        name: "Joe Mama",
        email: "joe.mama@gmail.com",
        avatar: "https://upload.wikimedia.org/wikipedia/commons/b/bc/President_Joe_Biden_2025.jpg",
    },
    navMain: [
    {   title: "Home",
        url: "#Home",
        icon: House,
    },
    {
        title: "Practice",
        url: "#practice",
        icon: Keyboard,
    },
    {
        title: "DPP",
        url: "#Home",
        icon: Target,
    },
    {
        title: "Project",
        url: "#projects",
        icon: FolderCode,
    },
    {
        title: "Upload",
        url: "#upload",
        icon: FolderUp,
    },
    {
        title: "Leaderboard",
        url: "#leaderboard",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Setting",
        url: "User_settings",
        icon: Bolt
    }
]

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const authPages = ["/sign-up", "/sign-in", "/verify"];

  if (authPages.includes(pathname)) return null;
  return (
    <Sidebar className="font-sans font-semibold antialiased"collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
