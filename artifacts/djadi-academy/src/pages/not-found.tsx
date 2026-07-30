import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/language-context";

export default function NotFound() {
  const { tk } = useLang();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-6" dir="rtl">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-6xl font-extrabold text-primary mb-2">404</h1>
          <h2 className="text-xl font-bold text-foreground mb-2">{tk("notFound.title")}</h2>
          <p className="text-muted-foreground">{tk("notFound.subtitle")}</p>
        </div>
        <Link href="/">
          <Button className="gap-2 rounded-xl h-11 font-bold">
            <Home className="h-4 w-4" />
            {tk("notFound.goHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
