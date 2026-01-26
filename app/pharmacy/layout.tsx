export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-linear-to-b from-[#0B1220] to-[#0E162A]">
      {children}
    </section>
  );
}
