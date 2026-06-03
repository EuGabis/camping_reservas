import Image from "next/image";
import { CONTATO, HORARIOS, LOGO } from "@/lib/conteudo";

export default function Rodape() {
  return (
    <footer className="bg-mata-900 text-areia-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-3 font-display text-2xl font-semibold text-areia-50">
            <Image
              src={LOGO}
              alt="Vapo Camping EcoPark"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
            Vapo Camping EcoPark
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-areia-200">
            Um refúgio na mata nativa de São Roque, criado por campistas para quem
            gosta de natureza de verdade.
          </p>
        </div>

        <div className="text-sm leading-relaxed">
          <p className="font-display text-lg text-areia-50">Onde estamos</p>
          <p className="mt-3 text-areia-200">{CONTATO.endereco}</p>
          <p className="text-areia-200">{CONTATO.bairro}</p>
          <p className="text-areia-200">CEP {CONTATO.cep}</p>
          <p className="mt-3 text-areia-200">{HORARIOS.funcionamento}</p>
        </div>

        <div className="text-sm leading-relaxed">
          <p className="font-display text-lg text-areia-50">Fale com a gente</p>
          <a
            href={`https://wa.me/${CONTATO.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-areia-200 hover:text-white"
          >
            WhatsApp {CONTATO.whatsappExibicao}
          </a>
          <div className="mt-3 flex gap-4">
            <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Instagram
            </a>
            <a href={CONTATO.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-mata-700/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 text-xs text-areia-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Vapo Camping EcoPark. Todos os direitos reservados.</p>
          <p>São Roque · SP · a 60 km de São Paulo</p>
        </div>
      </div>
    </footer>
  );
}
