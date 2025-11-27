export default function PageShell({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
