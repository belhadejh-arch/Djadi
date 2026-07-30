import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/IMG_0796_1785328682791.png";

const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          if (!res.user.grade) {
            setLocation("/grade-select");
          } else {
            setLocation("/dashboard");
          }
        },
        onError: (err: unknown) => {
          const msg =
            (err as { data?: { error?: string } })?.data?.error ??
            (err as { message?: string })?.message ??
            "تعذّر الاتصال بالسيرفر";
          const isBadCreds =
            msg.toLowerCase().includes("invalid") || msg.includes("بيانات");
          toast({
            variant: "destructive",
            title: "خطأ في تسجيل الدخول",
            description: isBadCreds
              ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
              : msg,
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-primary-foreground text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logoUrl} alt="Logo" className="w-32 h-32 mx-auto mb-8 drop-shadow-2xl brightness-0 invert" />
            <h1 className="text-4xl font-extrabold mb-4">منصة جعدي</h1>
            <p className="text-xl text-primary-foreground/80">رفيقك الذكي نحو البكالوريا</p>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative" dir="rtl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-right">
            <img src={logoUrl} alt="Logo" className="w-16 h-16 mx-auto md:hidden mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">مرحباً بعودتك!</h2>
            <p className="text-muted-foreground mt-2">سجل دخولك لمتابعة دروسك</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" type="email" className="h-12 text-lg text-left" dir="ltr" {...field} />
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
                    <FormLabel className="text-base font-semibold">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="h-12 text-lg text-left" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground pt-4">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-bold text-primary hover:underline flex items-center justify-center gap-1 inline-flex">
              أنشئ حساباً جديداً <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
