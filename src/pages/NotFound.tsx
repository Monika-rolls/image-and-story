import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const NotFound = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-3xl px-6 pt-24">
      <p className="font-mono text-[13px] text-subtle">404</p>
      <h1 className="mt-3 text-[36px] font-medium tracking-[-0.02em]">This page doesn't exist</h1>
      <p className="mt-3 text-[17px] text-muted-foreground">The link may be old, or the post may have moved.</p>
      <div className="mt-8 flex gap-5 text-[15px] font-medium">
        <Link to="/" className="underline decoration-border underline-offset-4 hover:decoration-primary">
          Home
        </Link>
        <Link to="/blog" className="underline decoration-border underline-offset-4 hover:decoration-primary">
          Writing
        </Link>
      </div>
    </main>
  </div>
);

export default NotFound;
