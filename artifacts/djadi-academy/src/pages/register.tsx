import { useState } from "react";
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

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "الاسم الكامل مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/grade-select");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { data?: { error?: string } })?.data?.error ??
            (err as { message?: string })?.message ??
            "تعذّر الاتصال بالسيرفر";
          const isEmailTaken = msg.toLowerCase().includes("already") || msg.includes("مستخدم");
          toast({
            variant: "destructive",
            title: "خطأ في إنشاء الحساب",
            description: isEmailTaken
              ? "هذا البريد الإلكتروني مستخدم بالفعل"
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
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-accent-foreground text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logoUrl} alt="Logo" className="w-32 h-32 mx-auto mb-8 drop-shadow-2xl" />
            <h1 className="text-4xl font-extrabold mb-4">خطوتك الأولى للنجاح</h1>
            <p className="text-xl text-accent-foreground/80">انضم للآلاف من الطلاب المتفوقين</p>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative" dir="rtl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-right">
            <img src={logoUrl} alt="Logo" className="w-16 h-16 mx-auto md:hidden mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">إنشاء حساب جديد</h2>
            <p className="text-muted-foreground mt-2">ابدأ رحلتك التعليمية معنا اليوم</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="أحمد محمد" className="h-12 text-lg" {...field} />
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

              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "إنشاء حساب"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground pt-4">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-bold text-primary hover:underline flex items-center justify-center gap-1 inline-flex">
              تسجيل الدخول <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
