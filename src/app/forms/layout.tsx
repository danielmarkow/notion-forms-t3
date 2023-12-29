import Link from "next/link";

export default function FormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Link href="/config">
        <h1 className="text-sm font-medium">Form</h1>
      </Link>
      {children}
    </>
  );
}
