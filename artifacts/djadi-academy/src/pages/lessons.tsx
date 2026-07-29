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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">مكتبة الدروس</h1>
          <p className="text-muted-foreground">ابحث وتصفح جميع الدروس المتاحة</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن درس..." 
            className="pl-4 pr-10 h-12 rounded-xl text-lg bg-card" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button 
            variant={filterType === null ? "default" : "outline"} 
            className="h-12 px-6 rounded-xl"
            onClick={() => setFilterType(null)}
          >
            الكل
          </Button>
          <Button 
            variant={filterType === 'video' ? "default" : "outline"} 
            className="h-12 px-6 rounded-xl"
            onClick={() => setFilterType('video')}
          >
            <PlayCircle className="w-4 h-4 ml-2" /> فيديو
          </Button>
          <Button 
            variant={filterType === 'pdf' ? "default" : "outline"} 
            className="h-12 px-6 rounded-xl"
            onClick={() => setFilterType('pdf')}
          >
            <FileText className="w-4 h-4 ml-2" /> ملفات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
              <Skeleton className="h-40 w-full rounded-xl mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : filteredLessons?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            لا توجد دروس تطابق معايير البحث
          </div>
        ) : (
          filteredLessons?.map(lesson => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden hover-elevate transition-all group cursor-pointer h-full flex flex-col">
                
                <div className="h-40 relative bg-muted flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  {lesson.type === 'video' ? (
                    <>
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&q=80')] bg-cover bg-center opacity-40"></div>
                      <PlayCircle className="w-16 h-16 text-white/80 z-20 group-hover:scale-110 transition-transform drop-shadow-lg" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512820200504-0f22ce2520ab?w=800&q=80')] bg-cover bg-center opacity-40"></div>
                      <FileText className="w-16 h-16 text-white/80 z-20 group-hover:scale-110 transition-transform drop-shadow-lg" />
                    </>
                  )}
                  <Badge className="absolute bottom-3 right-3 z-20" variant={lesson.type === 'video' ? "destructive" : "secondary"}>
                    {lesson.type === 'video' ? 'فيديو' : 'مستند'}
                  </Badge>
                  <div className="absolute bottom-3 left-3 z-20 text-white text-xs font-bold flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> {lesson.duration} د
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm font-semibold text-primary mb-2 truncate">{lesson.subjectName || "مادة عامة"}</p>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{lesson.titleAr}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">{lesson.description}</p>
                </div>
                
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
