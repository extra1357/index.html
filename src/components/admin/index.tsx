"use client";
import React, { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

export const AdminIcons = {
  Loader: () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  AlertCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  ArrowUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
  ArrowDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
};

interface PageHeaderProps { title: string; subtitle?: string; icon?: React.ReactNode; actions?: React.ReactNode; }
export function AdminPageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-violet-500/30">{icon}</div>}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

interface CardProps { children: React.ReactNode; className?: string; padding?: "none" | "sm" | "md" | "lg"; hover?: boolean; }
export function AdminCard({ children, className = "", padding = "md", hover = false }: CardProps) {
  const p = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 ${hover ? "hover:shadow-2xl transition-shadow" : ""} ${p[padding]} ${className}`}>{children}</div>;
}

interface StatCardProps { title: string; value: string | number; subtitle?: string; icon?: React.ReactNode; trend?: { value: number; label?: string }; variant?: "default" | "success" | "warning" | "danger" | "info"; }
export function AdminStatCard({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) {
  const v: Record<string, string> = { default: "from-slate-500 to-slate-600", success: "from-emerald-500 to-teal-600", warning: "from-amber-500 to-orange-600", danger: "from-red-500 to-rose-600", info: "from-blue-500 to-cyan-600" };
  const tc = trend && trend.value >= 0 ? "text-emerald-600" : "text-red-600";
  return (
    <AdminCard hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          {trend && <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${tc}`}>{trend.value >= 0 ? <AdminIcons.ArrowUp /> : <AdminIcons.ArrowDown />}<span>{Math.abs(trend.value)}%</span>{trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}</div>}
        </div>
        {icon && <div className={`p-3 bg-gradient-to-br ${v[variant]} rounded-xl text-white shadow-lg`}>{icon}</div>}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${v[variant]}`} />
    </AdminCard>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "secondary" | "danger" | "ghost" | "success"; size?: "sm" | "md" | "lg"; loading?: boolean; icon?: React.ReactNode; }
export const AdminButton = forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = "primary", size = "md", loading, icon, className = "", disabled, ...props }, ref) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const v: Record<string, string> = { primary: "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 focus:ring-violet-500", secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400", danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30 focus:ring-red-500", ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400", success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 focus:ring-emerald-500" };
  const s: Record<string, string> = { sm: "px-3 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  return <button ref={ref} disabled={disabled || loading} className={`${base} ${v[variant]} ${s[size]} ${className}`} {...props}>{loading ? <AdminIcons.Loader /> : icon}{children}</button>;
});
AdminButton.displayName = "AdminButton";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string; }
export const AdminInput = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
    <input ref={ref} className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 disabled:bg-slate-50 ${error ? "border-red-300" : "border-slate-300"} ${className}`} {...props} />
    {error && <p className="flex items-center gap-1 text-sm text-red-600"><AdminIcons.AlertCircle />{error}</p>}
    {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
  </div>
));
AdminInput.displayName = "AdminInput";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: { value: string; label: string }[]; }
export const AdminSelect = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
    <select ref={ref} className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 ${error ? "border-red-300" : "border-slate-300"} ${className}`} {...props}>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="flex items-center gap-1 text-sm text-red-600"><AdminIcons.AlertCircle />{error}</p>}
  </div>
));
AdminSelect.displayName = "AdminSelect";

interface BadgeProps { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "purple"; size?: "sm" | "md"; }
export function AdminBadge({ children, variant = "default", size = "md" }: BadgeProps) {
  const v: Record<string, string> = { default: "bg-slate-100 text-slate-700", success: "bg-emerald-100 text-emerald-700", warning: "bg-amber-100 text-amber-700", danger: "bg-red-100 text-red-700", info: "bg-blue-100 text-blue-700", purple: "bg-violet-100 text-violet-700" };
  const s: Record<string, string> = { sm: "px-2 py-0.5 text-xs", md: "px-3 py-1 text-sm" };
  return <span className={`inline-flex items-center font-semibold rounded-full ${v[variant]} ${s[size]}`}>{children}</span>;
}

interface Column<T> { key: string; header: string; render?: (item: T) => React.ReactNode; className?: string; }
interface TableProps<T> { columns: Column<T>[]; data: T[]; loading?: boolean; emptyMessage?: string; onRowClick?: (item: T) => void; }
export function AdminTable<T extends { id: string }>({ columns, data, loading, emptyMessage = "Nenhum registro", onRowClick }: TableProps<T>) {
  if (loading) return <AdminCard padding="lg"><div className="flex items-center justify-center py-12"><AdminIcons.Loader /><span className="ml-3 text-slate-500">Carregando...</span></div></AdminCard>;
  if (!data.length) return <AdminCard padding="lg"><div className="text-center py-12 text-slate-500">{emptyMessage}</div></AdminCard>;
  return (
    <AdminCard padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-slate-200">{columns.map((c: any) => <th key={c.key} className={`px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${c.className || ""}`}>{c.header}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item: any, i: number) => <tr key={item.id} onClick={() => onRowClick?.(item)} className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} ${onRowClick ? "cursor-pointer hover:bg-violet-50/50" : ""} transition-colors`}>{columns.map((c: any) => <td key={c.key} className={`px-6 py-4 ${c.className || ""}`}>{c.render ? c.render(item) : (item as any)[c.key]}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl"; footer?: React.ReactNode; }
export function AdminModal({ isOpen, onClose, title, children, size = "md", footer }: ModalProps) {
  if (!isOpen) return null;
  const s: Record<string, string> = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full ${s[size]} bg-white rounded-2xl shadow-2xl`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><AdminIcons.X /></button>
          </div>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
          {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

interface AlertProps { type: "success" | "error" | "warning" | "info"; title?: string; message: string; onClose?: () => void; }
export function AdminAlert({ type, title, message, onClose }: AlertProps) {
  const t: Record<string, string> = { success: "bg-emerald-50 border-emerald-200 text-emerald-800", error: "bg-red-50 border-red-200 text-red-800", warning: "bg-amber-50 border-amber-200 text-amber-800", info: "bg-blue-50 border-blue-200 text-blue-800" };
  const icons = { success: <AdminIcons.Check />, error: <AdminIcons.X />, warning: <AdminIcons.AlertCircle />, info: <AdminIcons.Info /> };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${t[type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">{title && <p className="font-semibold">{title}</p>}<p className={title ? "mt-1" : ""}>{message}</p></div>
      {onClose && <button onClick={onClose} className="flex-shrink-0 hover:opacity-70"><AdminIcons.X /></button>}
    </div>
  );
}

interface SearchBarProps { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; }
export function AdminSearchBar({ value, onChange, placeholder = "Buscar...", className = "" }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><AdminIcons.Search /></div>
      <input type="text" value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500" />
    </div>
  );
}

interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (p: number) => void; }
export function AdminPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages: number[] = [];
  let start = Math.max(1, currentPage - 2), end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="flex items-center justify-center gap-2">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50"><AdminIcons.ChevronLeft /></button>
      {pages.map((p: any) => <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1.5 text-sm rounded-lg ${p === currentPage ? "bg-violet-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>)}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50"><AdminIcons.ChevronRight /></button>
    </div>
  );
}
