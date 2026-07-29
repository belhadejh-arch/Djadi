import { useListSubjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Subjects() {
  const { data: subjects, isLoading } = useListSubjects();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = subjects?.filter((s) => 
    s.nameAr.includes(searchTerm) || s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">المواد الدراسية</h1>
          <p className="text-muted-foreground">تصفح جميع المواد المتاحة لمستواك الدراسي</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن مادة..." 
            className="pl-4 pr-10 h-12 rounded-xl text-lg bg-card" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 h-48 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : filteredSubjects?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            لا توجد مواد تطابق بحثك
          </div>
        ) : (
          filteredSubjects?.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link href={`/subjects/${subject.id}`}>
                <div className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 hover-elevate hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col group">
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: subject.color || "hsl(var(--primary))" }}
                    >
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
                      {subject.lessonCount} درس
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{subject.nameAr}</h2>
                    <h3 className="text-sm text-muted-foreground font-sans uppercase tracking-wider mb-3" dir="ltr">{subject.nameFr || subject.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
