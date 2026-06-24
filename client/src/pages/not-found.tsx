import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl font-black text-amber-400 stat-number">404</div>
      <p className="text-muted-foreground text-sm">Page not found</p>
      <Link href="/">
        <a className="text-sm text-amber-400 hover:underline">Back to dashboard</a>
      </Link>
    </div>
  );
}
