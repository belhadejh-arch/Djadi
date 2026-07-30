import { useState, ReactNode } from "react";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface CrudTableProps<T extends { id: number }> {
  title: string;
  data?: T[];
  isLoading: boolean;
  columns: Column<T>[];
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  extraActions?: (row: T) => ReactNode;
  addLabel?: string;
}

export function CrudTable<T extends { id: number }>({
  title, data, isLoading, columns, onAdd, onEdit, onDelete,
  isDeleting, searchable, searchPlaceholder = "بحث...", extraActions, addLabel = "إضافة",
}: CrudTableProps<T>) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = searchable && search
    ? data?.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 ml-1.5" />
            {addLabel}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {searchable && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pr-9 text-sm"
                />
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {columns.map((col, i) => (
                    <TableHead key={i} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                  <TableHead className="w-28">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : !filtered?.length ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8">
                      لا توجد بيانات
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((col, j) => (
                        <TableCell key={j} className={col.className}>
                          {col.cell(row)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {extraActions?.(row)}
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => onEdit(row)}
                            title="تعديل"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(row.id)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
