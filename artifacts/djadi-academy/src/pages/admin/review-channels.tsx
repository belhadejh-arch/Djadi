import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Video } from "lucide-react";

const emptyChannel = {
  channelName: "",
  teacherName: "",
  subjectId: null as number | null,
  imageUrl: "",
  sortOrder: 0,
  // UI-only cascade state (not sent to API)
  _grade: "premiere",
  _branchId: null as number | null,
};
const emptyVideo = { title: "", titleAr: "", videoUrl: "", sortOrder: 0 };

export default function AdminReviewChannels() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyChannel);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [videoForm, setVideoForm] = useState(emptyVideo);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "review-channels"], queryFn: adminApi.reviewChannels.list });
  const { data: channelDetail } = useQuery({
    queryKey: ["admin", "review-channels", selectedChannel?.id],
    queryFn: () => adminApi.reviewChannels.get(selectedChannel!.id),
    enabled: !!selectedChannel,
  });
  const { data: levels = [] } = useQuery({ queryKey: ["admin", "levels"], queryFn: adminApi.levels.list });
  const { data: branches = [] } = useQuery({ queryKey: ["admin", "branches"], queryFn: adminApi.branches.list });
  const { data: subjects = [] } = useQuery({ queryKey: ["admin", "subjects"], queryFn: adminApi.subjects.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "review-channels"] });

  const FALLBACK_GRADES = [
    { code: "premiere",  nameAr: "السنة الأولى ثانوي" },
    { code: "deuxieme",  nameAr: "السنة الثانية ثانوي" },
    { code: "troisieme", nameAr: "السنة الثالثة ثانوي" },
  ];
  const gradeOptions = (levels as any[]).length > 0 ? levels : FALLBACK_GRADES;

  // Find selected level record
  const selectedLevel = (levels as any[]).find((l) => l.code === form._grade);

  // Branches for selected level
  const filteredBranches = selectedLevel
    ? (branches as any[]).filter((b) => {
        const ids: number[] = Array.isArray(b.levelIds) && b.levelIds.length > 0
          ? b.levelIds : [b.levelId];
        return ids.includes(selectedLevel.id);
      })
    : [];

  // Subjects for selected grade + branch
  const filteredSubjects = (subjects as any[]).filter((s) => {
    if (s.grade !== form._grade) return false;
    if (!form._branchId) return true;
    return s.branchId === null || s.branchId === form._branchId;
  });

  const create = useMutation({ mutationFn: adminApi.reviewChannels.create, onSuccess: () => { invalidate(); close(); toast({ title: "تم الإضافة" }); } });
  const update = useMutation({ mutationFn: ({ id, body }: any) => adminApi.reviewChannels.update(id, body), onSuccess: () => { invalidate(); close(); toast({ title: "تم التعديل" }); } });
  const del = useMutation({ mutationFn: adminApi.reviewChannels.delete, onSuccess: () => { invalidate(); setSelectedChannel(null); toast({ title: "تم الحذف" }); } });
  const addVideo = useMutation({ mutationFn: ({ chId, body }: any) => adminApi.reviewChannels.addVideo(chId, body), onSuccess: () => { invalidate(); closeVideo(); toast({ title: "تمت إضافة الفيديو" }); } });
  const delVideo = useMutation({ mutationFn: ({ chId, vId }: any) => adminApi.reviewChannels.deleteVideo(chId, vId), onSuccess: () => invalidate() });

  function open(row?: any) {
    if (row) {
      setEditing(row);
      setForm({ ...emptyChannel, channelName: row.channelName, teacherName: row.teacherName, subjectId: row.subjectId ?? null, imageUrl: row.imageUrl ?? "", sortOrder: row.sortOrder ?? 0 });
    } else {
      setEditing(null);
      setForm(emptyChannel);
    }
    setDialogOpen(true);
  }
  function close() { setDialogOpen(false); setEditing(null); }

  function submit() {
    if (!form.channelName.trim()) { toast({ title: "يجب إدخال اسم القناة", variant: "destructive" }); return; }
    if (!form.teacherName.trim()) { toast({ title: "يجب إدخال اسم الأستاذ", variant: "destructive" }); return; }
    if (!form.subjectId)          { toast({ title: "يجب اختيار المادة", variant: "destructive" }); return; }

    const { _grade: _g, _branchId: _b, ...rest } = form;
    const body = { ...rest, imageUrl: form.imageUrl || null };
    if (editing) update.mutate({ id: editing.id, body });
    else create.mutate(body);
  }

  function openVideo(vid?: any) {
    if (vid) { setEditingVideo(vid); setVideoForm({ ...emptyVideo, ...vid }); }
    else { setEditingVideo(null); setVideoForm(emptyVideo); }
    setVideoDialogOpen(true);
  }
  function closeVideo() { setVideoDialogOpen(false); setEditingVideo(null); }
  function submitVideo() {
    if (!selectedChannel) return;
    addVideo.mutate({ chId: selectedChannel.id, body: { ...videoForm, sortOrder: Number(videoForm.sortOrder) } });
  }

  const f = (k: "channelName" | "teacherName" | "imageUrl") =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const fv = (k: keyof typeof videoForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVideoForm((p) => ({ ...p, [k]: k === "sortOrder" ? Number(e.target.value) : e.target.value }));

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-xl font-bold">إدارة قنوات المراجعة</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <CrudTable
          title="القنوات"
          data={data}
          isLoading={isLoading}
          onAdd={() => open()}
          onEdit={open}
          onDelete={(id) => del.mutate(id)}
          isDeleting={del.isPending}
          columns={[
            { header: "القناة", cell: (r) => <button className="font-medium text-primary hover:underline text-right" onClick={() => setSelectedChannel(r)}>{r.channelName}</button> },
            { header: "الأستاذ", cell: (r) => r.teacherName },
            { header: "المادة", cell: (r) => r.subjectName ?? "—" },
          ]}
        />

        {selectedChannel && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">فيديوهات: {selectedChannel.channelName}</CardTitle>
              <Button size="sm" onClick={() => openVideo()}>
                <Plus className="h-4 w-4 ml-1" />إضافة
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {!channelDetail?.videos?.length && <p className="text-sm text-muted-foreground text-center py-4">لا توجد فيديوهات</p>}
              {channelDetail?.videos?.map((v: any) => (
                <div key={v.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.titleAr}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.videoUrl}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => delVideo.mutate({ chId: selectedChannel.id, vId: v.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Channel form dialog */}
      <FormDialog open={dialogOpen} onClose={close} title={editing ? "تعديل القناة" : "إضافة قناة"} onSubmit={submit} isSubmitting={create.isPending || update.isPending}>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>اسم القناة <span className="text-destructive">*</span></Label>
            <Input value={form.channelName} onChange={f("channelName")} />
          </div>
          <div className="space-y-1">
            <Label>اسم الأستاذ <span className="text-destructive">*</span></Label>
            <Input value={form.teacherName} onChange={f("teacherName")} />
          </div>

          {/* Cascade: level → branch → subject (required) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Level */}
            <div className="space-y-1">
              <Label>المستوى <span className="text-destructive">*</span></Label>
              <Select
                value={form._grade}
                onValueChange={(v) => setForm((p) => ({ ...p, _grade: v, _branchId: null, subjectId: null }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(gradeOptions as any[]).map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div className="space-y-1">
              <Label>الشعبة <span className="text-destructive">*</span></Label>
              <Select
                value={form._branchId ? String(form._branchId) : ""}
                onValueChange={(v) => setForm((p) => ({ ...p, _branchId: Number(v), subjectId: null }))}
                disabled={!form._grade}
              >
                <SelectTrigger><SelectValue placeholder="اختر الشعبة..." /></SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((b: any) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject — required */}
            <div className="space-y-1">
              <Label>المادة <span className="text-destructive">*</span></Label>
              <Select
                value={form.subjectId ? String(form.subjectId) : ""}
                onValueChange={(v) => setForm((p) => ({ ...p, subjectId: Number(v) }))}
                disabled={!form._branchId}
              >
                <SelectTrigger><SelectValue placeholder={form._branchId ? "اختر المادة..." : "اختر الشعبة أولاً"} /></SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>رابط صورة القناة (اختياري)</Label>
            <Input value={form.imageUrl} onChange={f("imageUrl")} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <Label>الترتيب</Label>
            <Input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
          </div>
        </div>
      </FormDialog>

      {/* Video form dialog */}
      <FormDialog open={videoDialogOpen} onClose={closeVideo} title="إضافة فيديو" onSubmit={submitVideo} isSubmitting={addVideo.isPending}>
        <div className="space-y-3">
          <div className="space-y-1"><Label>العنوان (عربي)</Label><Input value={videoForm.titleAr} onChange={fv("titleAr")} /></div>
          <div className="space-y-1"><Label>العنوان (فرنسي)</Label><Input value={videoForm.title} onChange={fv("title")} /></div>
          <div className="space-y-1"><Label>رابط الفيديو</Label><Input value={videoForm.videoUrl} onChange={fv("videoUrl")} placeholder="https://youtube.com/..." /></div>
          <div className="space-y-1"><Label>الترتيب</Label><Input type="number" value={videoForm.sortOrder} onChange={fv("sortOrder")} /></div>
        </div>
      </FormDialog>
    </div>
  );
}
