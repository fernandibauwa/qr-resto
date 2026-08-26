export default function HomePage() {
  const links = [
    { href: "/menu?table=01", label: "🍽️ Customer Menu (contoh Meja 01)" },
    { href: "/kds", label: "🍳 Kitchen Display System (KDS)" },
    { href: "/kasir", label: "💳 Kasir" },
    { href: "/owner", label: "🧑‍💼 Owner Dashboard" },
  ];
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-3">
        <h1 className="text-2xl font-bold text-center mb-6">QR Resto POS</h1>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="card block p-4 text-center font-semibold hover:bg-gray-50"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
