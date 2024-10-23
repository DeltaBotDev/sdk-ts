import Link from 'next/link';

export default function Home() {
  const links = [
    { label: 'Market', href: '/market' },
    { label: 'Create DCA', href: '/create-dca' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="hover:underline hover:text-primary">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
