import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import AdminSidebar from "./AdminSidebar";

export default function AdminMobileSidebar({ open, onOpenChange, ...props }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="admin-console w-[280px] max-w-[90vw] gap-0 p-0"
      >
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate the Pranjal Pathshala admin console.
        </SheetDescription>
        <AdminSidebar {...props} onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
