import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/IMG_0796_1785328682791.png";
import { useLang } from "@/lib/language-context";
import { cacheUser } from "@/components/protected-route";

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const { tk } = useLang();

  const registerSchema = z.object({
    fullName: z.string().min(2, { message: tk("auth.fullName") }),
    email: z.string().email({ message: tk("auth.invalidEmail") }),
    password: z.string().min(6, { message: tk("auth.passwordMin") }),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: (res: any) => {
          if (res?.user) cacheUser(res.user);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/grade-select");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { data?: { error?: string } })?.data?.error ??
            (err as { message?: string })?.message ??
            tk("auth.serverError");
          const isEmailTaken = msg.toLowerCase().includes("already") || msg.includes("مستخدم");
          toast({
            variant: "destructive",
            title: tk("auth.loginError"),
            description: isEmailTaken
              ? (tk("auth.email") + " " + "مستخدم بالفعل")
              : msg,
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row-reverse bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-accent relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="relative z-10 text-accent-foreground text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logoUrl} alt="Logo" className="w-32 h-32 mx-auto mb-8 drop-shadow-2xl" />
            <h1 className="text-4xl font-extrabold mb-4">{tk("auth.registerSlogan")}</h1>
            <p className="text-xl text-accent-foreground/80">{tk("auth.registerSubtitle")}</p>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12" dir="rtl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-right">
            <img src={logoUrl} alt="Logo" className="w-16 h-16 mx-auto md:hidden mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{tk("auth.register")}</h2>
            <p className="text-muted-foreground mt-2">{tk("auth.registerStart")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">{tk("auth.fullName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={tk("auth.namePlaceholder")} className="h-12 text-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">{tk("auth.email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={tk("auth.emailPlaceholder")} type="email" className="h-12 text-lg text-left" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">{tk("auth.password")}</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="h-12 text-lg text-left" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : tk("auth.register")}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground pt-4">
            {tk("auth.hasAccount")}{" "}
            <Link href="/login" className="font-bold text-primary hover:underline inline-flex items-center gap-1">
              {tk("auth.signIn")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
