import Link from 'next/link';

export default function Home() {
  const links = [
    { label: 'Market', href: '/market' },
    { label: 'Vaults', children: [{ label: 'DCA', href: '/vaults/dca' }] },
  ];

  return (
    <div className="p-5">
      {links.map((link) => (
        <div key={link.label}>
          {link.children ? (
            <div>
              <div className="text-sm text-default-500 py-3">{link.label}</div>
              {link.children.map((child) => (
                <Link key={child.href} href={child.href} className="card cursor-pointer mb-2">
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link href={link.href} className="card cursor-pointer mb-2">
              {link.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
