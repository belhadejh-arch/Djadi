import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Bell, BookOpen, GraduationCap, CheckCircle2, Info, AlertTriangle, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type Notification } from "@/lib/notifications-context";

function NotificationIcon({ icon }: { icon: Notification["icon"] }) {
  const map = {
    info: { Icon: Info, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
    warning: { Icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400" },
    success: { Icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
    lesson: { Icon: BookOpen, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-600 dark:text-purple-400" },
    exam: { Icon: GraduationCap, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600 dark:text-orange-400" },
  };
  const { Icon, bg, color } = map[icon] ?? map.info;
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  );
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

export default function Notifications() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">الإشعارات</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">الإشعارات</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} إشعار غير مقروء</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            تعليم الكل كمقروء
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-2xl p-16 text-center space-y-3">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-muted-foreground">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => markRead(notif.id)}
              className={`bg-card rounded-2xl border p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md ${
                !notif.read
                  ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                  : "border-border"
              }`}
            >
              <NotificationIcon icon={notif.icon} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1 mb-1">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="font-bold text-base leading-tight">{notif.title}</h3>
                    {!notif.read && (
                      <Badge className="text-xs px-2 py-0 bg-primary text-primary-foreground shrink-0">جديد</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 text-left" dir="ltr">
                    <div>{notif.time}</div>
                    <div>{formatDate(notif.date)}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{notif.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
