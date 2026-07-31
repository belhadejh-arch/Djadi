import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { CrudTable } from "@/components/admin/crud-table";
import { LevelBranchSubjectSelector } from "@/components/admin/level-branch-subject-selector";
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
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "review-channels"] });
    // Also invalidate the student-facing list so changes appear immediately
    qc.invalidateQueries({ queryKey: ["review-channels"] });
  };

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

          {/* Cascade: level → branch → subject (required) — from the shared catalog */}
          <LevelBranchSubjectSelector
            grade={form._grade}
            branchId={form._branchId}
            subjectId={form.subjectId}
            onGradeChange={(v)     => setForm((p) => ({ ...p, _grade: v, _branchId: null, subjectId: null }))}
            onBranchIdChange={(v)  => setForm((p) => ({ ...p, _branchId: v, subjectId: null }))}
            onSubjectIdChange={(v) => setForm((p) => ({ ...p, subjectId: v }))}
            branchRequired
            subjectRequired
          />

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
