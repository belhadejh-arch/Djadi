import { useListLessons } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Search, PlayCircle, FileText, Clock, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Lessons() {
  const { data: lessons, isLoading } = useListLessons();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredLessons = lessons?.filter(l => {
    const matchesSearch = l.titleAr.includes(searchTerm) || l.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? l.type === filterType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">مكتبة الدروس</h1>
          <p className="text-sm text-muted-foreground">ابحث وتصفح جميع الدروس المتاحة</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن درس..." 
            className="pl-4 pr-9 h-9 rounded-xl bg-card" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button 
            variant={filterType === null ? "default" : "outline"} 
            size="sm"
            className="h-9 px-4 rounded-xl"
            onClick={() => setFilterType(null)}
          >
            الكل
          </Button>
          <Button 
            variant={filterType === 'video' ? "default" : "outline"} 
            size="sm"
            className="h-9 px-4 rounded-xl"
            onClick={() => setFilterType('video')}
          >
            <PlayCircle className="w-3.5 h-3.5 ml-1.5" /> فيديو
          </Button>
          <Button 
            variant={filterType === 'pdf' ? "default" : "outline"} 
            size="sm"
            className="h-9 px-4 rounded-xl"
            onClick={() => setFilterType('pdf')}
          >
            <FileText className="w-3.5 h-3.5 ml-1.5" /> ملفات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-2xl shadow-sm border border-border/50">
              <Skeleton className="h-28 w-full rounded-xl mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : filteredLessons?.length === 0 ? (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            لا توجد دروس تطابق معايير البحث
          </div>
        ) : (
          filteredLessons?.map(lesson => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden hover-elevate transition-all group cursor-pointer h-full flex flex-col">
                
                <div className="h-28 sm:h-32 relative bg-muted flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  {lesson.type === 'video' ? (
                    <>
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&q=80')] bg-cover bg-center opacity-40"></div>
                      <PlayCircle className="w-12 h-12 text-white/80 z-20 group-hover:scale-110 transition-transform drop-shadow-lg" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512820200504-0f22ce2520ab?w=800&q=80')] bg-cover bg-center opacity-40"></div>
                      <FileText className="w-12 h-12 text-white/80 z-20 group-hover:scale-110 transition-transform drop-shadow-lg" />
                    </>
                  )}
                  <Badge className="absolute bottom-2 right-2 z-20 text-[11px] py-0 px-2" variant={lesson.type === 'video' ? "destructive" : "secondary"}>
                    {lesson.type === 'video' ? 'فيديو' : 'مستند'}
                  </Badge>
                  <div className="absolute bottom-2 left-2 z-20 text-white text-[11px] font-bold flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded">
                    <Clock className="w-2.5 h-2.5" /> {lesson.duration} د
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col">
                  <p className="text-xs font-semibold text-primary mb-1 truncate">{lesson.subjectName || "مادة عامة"}</p>
                  <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2">{lesson.titleAr}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-auto">{lesson.description}</p>
                </div>
                
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
