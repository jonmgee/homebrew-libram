import { TERMS_URL, PRIVACY_URL } from "../lib/legal";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-4 pb-6 pt-2 text-center">
      <img
        src="/assets/PHB_footerAccent.png"
        alt=""
        className="phb-flourish mb-3"
      />
      <p className="phb-description text-xs italic leading-relaxed">
        To report a curse, suggest a new exhibit, or seek an audience with the
        Scribes — write to{" "}
        <a
          href="mailto:hello@appwrightsguild.com"
          className="text-[#58180d] underline underline-offset-2 transition-colors hover:text-[#7a2212]"
        >
          hello@appwrightsguild.com
        </a>
      </p>
      <p className="phb-description mt-2 text-xs italic">
        <a href={TERMS_URL} className="underline underline-offset-2">Terms</a>
        {" · "}
        <a href={PRIVACY_URL} className="underline underline-offset-2">Privacy</a>
      </p>
    </footer>
  );
}
