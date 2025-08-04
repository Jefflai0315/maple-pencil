import { Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 px-4">
      <div className="wavy-divider mb-8"></div>
      <div className="max-w-6xl mx-auto text-center">
        <div className="font-handwritten text-3xl font-bold text-charcoal mb-4">
          Playing with Pencil
        </div>
        <p className="font-sketch text-charcoal-medium mb-6">
          Spreading joy one sketch at a time • Singapore
        </p>
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href="https://instagram.com/playingwithpencil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-charcoal-medium hover:text-charcoal transition-colors transform hover:rotate-12"
            // onClick={() =>
            //   trackButtonClick("Instagram - Footer", "social_media")
            // }
          >
            <Instagram size={24} />
          </a>
          <a
            href="mailto:playingwithpencil@gmail.com"
            className="text-charcoal-medium hover:text-charcoal transition-colors transform hover:rotate-12"
            // onClick={() => trackButtonClick("Email - Footer", "contact")}
          >
            <Mail size={24} />
          </a>
        </div>
        <p className="font-body text-sm text-charcoal-light">
          © 2025 Jeff Lai. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
