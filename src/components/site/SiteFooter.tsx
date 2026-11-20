import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      className="pwp"
      style={{
        backgroundColor: "#ff6f1e",
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        overflow: "clip",
        marginTop: -1,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "56px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {/* Top: tagline + link columns */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          <h2
            className="pwp-display"
            style={{
              color: "#fff",
              fontSize: "clamp(26px, 3vw, 40px)",
              lineHeight: 1.25,
              margin: 0,
              maxWidth: 480,
            }}
          >
            Spreading joy,
            <br />
            one sketch at a time
          </h2>

          <nav
            aria-label="Footer"
            style={{
              display: "flex",
              gap: "clamp(48px, 8vw, 116px)",
              fontSize: 18,
              fontWeight: 500,
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FooterLink href="/#work">Work</FooterLink>
              <FooterLink href="/#services">Services</FooterLink>
              <FooterLink href="/#about">About</FooterLink>
              <FooterLink href="/#contact">Contact</FooterLink>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FooterLink href="/app">Pencil Trace app</FooterLink>
              <FooterLink href="/world">Game world</FooterLink>
              <FooterLink href="/sembawang-mural">Mural</FooterLink>
              <FooterLink href="/app/support">Support me</FooterLink>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FooterLink href="https://instagram.com/playingwithpencil" external>
                Instagram
              </FooterLink>
              <FooterLink href="mailto:playingwithpencil@gmail.com">
                Write to me
              </FooterLink>
            </div>
          </nav>
        </div>

        {/* Giant wordmark */}
        <div style={{ marginTop: "auto" }}>
          <div
            className="pwp-script"
            aria-hidden
            style={{
              color: "#fdfbf9",
              fontSize: "clamp(56px, 11.5vw, 190px)",
              lineHeight: 0.95,
              textAlign: "center",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            playing with pencil
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 8,
              paddingTop: 24,
              paddingBottom: 8,
              fontSize: 17,
              fontWeight: 500,
              color: "#ce500a",
            }}
          >
            <span>© {new Date().getFullYear()} Jeff Lai · Playing with Pencil</span>
            <span>Drawn and built in Singapore</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{ color: "#fff", textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}
