import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, AlertTriangle, MessageCircle, ArrowRight, FileText, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/compra-segura")({ component: CompraSegura });

const checklist = [
  "Solicite fotos do chassi e número do motor antes de visitar",
  "Verifique se o número do motor bate com o documento",
  "Peça o histórico de todas as transferências (DUTs antigos)",
  "Calcule os custos de regularização antes de fechar o preço",
  "Exija que o vendedor assine recibo com CPF e dados completos",
  "Faça vistoria cautelar antes de transferir qualquer valor",
  "Prefira vendedores com badge de identidade confirmada (dourado)",
  "Desconfie de preços muito abaixo do mercado para o modelo",
  'Para "carro para fazer": visite pessoalmente antes de qualquer pagamento',
  "Use o chat da plataforma — mantenha histórico da negociação",
  "Nunca pague reserva por PIX antes de ver o veículo",
];

const costTable = [
  { pendencia: "IPVA atrasado (1 ano)", estimativa: "R$ 800 – R$ 2.500", obs: "Varia pelo estado e valor venal" },
  { pendencia: "IPVA atrasado (3+ anos)", estimativa: "R$ 2.000 – R$ 8.000", obs: "Com multas e juros acumulados" },
  { pendencia: "Licenciamento atrasado", estimativa: "R$ 200 – R$ 600/ano", obs: "Por exercício em atraso" },
  { pendencia: "Transferência (3ª parte)", estimativa: "R$ 400 – R$ 800", obs: "Taxa DETRAN + despachante" },
  { pendencia: "Multas de trânsito", estimativa: "Valor declarado + 20%", obs: "Multas antigas com correção" },
  { pendencia: "Regularização extrajudicial", estimativa: "R$ 1.500 – R$ 5.000", obs: "Falecido ou empresa extinta" },
  { pendencia: "Laudo cautelar (vistoria)", estimativa: "R$ 200 – R$ 500", obs: "Recomendado antes de comprar" },
];

function CompraSegura() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-[color:var(--color-charcoal)] text-white py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--color-terracotta)]/20 mb-6">
              <ShieldCheck className="h-10 w-10 text-[color:var(--color-terracotta)]" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl mb-5">Guia de Compra Segura</h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto">
              O mercado de clássicos tem suas particularidades. Este guia foi criado para que você compre
              com total transparência, sem surpresas e com segurança jurídica. Conhecimento é a melhor
              proteção contra golpes e decepções.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-14 space-y-16">

          {/* Seção 1: Checklist */}
          <section>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-6 w-6 text-[#1D6E4E]" />
              <h2 className="font-serif text-2xl">Checklist do comprador</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-7 pl-9">
              Use estes 11 pontos como roteiro antes de fechar qualquer negócio.
            </p>
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-[#E8E6E0] bg-white p-4 shadow-sm hover:border-[#1D6E4E]/30 transition-colors">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1D6E4E]/10 mt-0.5">
                    <span className="text-[10px] font-bold text-[#1D6E4E]">{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Seção 2: Por que clássicos têm pendências documentais */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-[#185FA5]" />
              <h2 className="font-serif text-2xl">Por que clássicos têm pendências documentais?</h2>
            </div>
            <div className="rounded-xl border border-[#E8E6E0] bg-white p-6 shadow-sm space-y-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                É completamente normal — e muito comum — que veículos com 30, 40 ou 50 anos acumulem
                irregularidades documentais ao longo de sua história. Isso <strong>não significa, automaticamente,
                que há fraude ou má-fé</strong> por parte do vendedor. São décadas de transferências, donos
                falecidos, empresas encerradas, endereços mudados e legislações que mudaram.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Um Fusca de 1972 pode ter passado por 6 ou 7 donos. Em cada transferência existe a
                chance de um documento incompleto, um IPVA não pago, um licenciamento esquecido.
                Muitos proprietários mantêm veículos guardados por anos sem usar — e sem pagar — simplesmente
                porque os carros ficam em garagem e o DETRAN não bate à porta. Quando o carro sai à venda
                décadas depois, essas pendências aparecem naturalmente.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                A presença de pendências documentais deve ser usada como <strong>argumento de negociação de preço</strong>,
                não como motivo de desistência automática. O importante é conhecer exatamente o que precisa ser
                regularizado, calcular o custo real e incluí-lo na sua proposta. O ClassicosBR facilita isso com o
                Dossiê Documental exibido em cada anúncio — antes mesmo de entrar em contato com o vendedor.
              </p>
            </div>
          </section>

          {/* Seção 3: Como usar a Tabela FIPE */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-[#185FA5]" />
              <h2 className="font-serif text-2xl">Como usar a Tabela FIPE</h2>
            </div>
            <div className="rounded-xl border border-[#E8E6E0] bg-white p-6 space-y-4 shadow-sm">
              <p className="text-sm text-foreground/80 leading-relaxed">
                A Tabela FIPE é o principal referencial de mercado para precificação de veículos no Brasil,
                mas para clássicos ela deve ser usada com cautela. Os valores FIPE são médias calculadas
                periodicamente e podem não refletir o estado real do veículo ou a raridade do modelo.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Use o percentual em relação à FIPE como <strong>ponto de partida</strong>, não como valor absoluto:
              </p>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li className="flex items-start gap-3 rounded-lg bg-[#1D6E4E]/5 border border-[#1D6E4E]/15 p-3">
                  <span className="text-[#1D6E4E] font-bold shrink-0 mt-0.5">▲</span>
                  <span><strong>Acima da FIPE (até +20%):</strong> normal para carros em ótimo estado, originais e com documentação perfeita.</span>
                </li>
                <li className="flex items-start gap-3 rounded-lg bg-[#185FA5]/5 border border-[#185FA5]/15 p-3">
                  <span className="text-[#185FA5] font-bold shrink-0 mt-0.5">–</span>
                  <span><strong>Na faixa da FIPE (±15%):</strong> preço justo, típico de veículos "para fazer" ou com pendências documentais.</span>
                </li>
                <li className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <span className="text-amber-600 font-bold shrink-0 mt-0.5">▼</span>
                  <span><strong>Abaixo de –30%:</strong> reflita. Pode ser legítimo (veículo para peças, situação documental grave), mas exige atenção redobrada.</span>
                </li>
                <li className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
                  <span className="text-red-600 font-bold shrink-0 mt-0.5">⚠</span>
                  <span><strong>Abaixo de –50%:</strong> sinal de alerta automático no ClassicosBR. Investigue antes de qualquer contato.</span>
                </li>
              </ul>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Sempre pesquise outros anúncios do mesmo modelo para ter uma noção real do que o mercado
                está praticando. A FIPE é referência, não regra.
              </p>
            </div>
          </section>

          {/* Seção 4: Tabela de custos de regularização */}
          <section>
            <h2 className="font-serif text-2xl mb-2">Estimativa de custos de regularização</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Valores médios para uso como referência na negociação. Consulte um despachante especializado
              para orçamento preciso para o seu caso.
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#E8E6E0] shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E6E0] bg-secondary/50">
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80">Pendência</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80">Custo estimado</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground/80 hidden sm:table-cell">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E6E0] bg-white">
                  {costTable.map((row, i) => (
                    <tr key={i} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.pendencia}</td>
                      <td className="px-4 py-3 text-[#1D6E4E] font-semibold">{row.estimativa}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{row.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Seção 5: Banner anti-fraude */}
          <section>
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-lg text-red-800 mb-3">⚠️ Sinais de alerta — fuja desses padrões</h3>
                  <ul className="space-y-2.5 text-sm text-red-700">
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0 mt-0.5">•</span>
                      <span><strong>Preço mais de 50% abaixo da FIPE</strong> sem justificativa clara (veículo para peças, documentação inviável)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0 mt-0.5">•</span>
                      <span><strong>Recusa em mostrar o chassi</strong> ou número do motor presencialmente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0 mt-0.5">•</span>
                      <span><strong>Pedido de PIX ou depósito antecipado</strong> antes da visita ao veículo, mesmo que seja "apenas reserva"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0 mt-0.5">•</span>
                      <span><strong>Vendedor quer sair do chat da plataforma</strong> para WhatsApp ou e-mail antes de estabelecer confiança</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0 mt-0.5">•</span>
                      <span><strong>Fotos com marcas d'água de outros sites</strong> ou imagens genéricas sem mostrar detalhes do chassi e motor</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center space-y-5">
            <Link
              to="/anuncios"
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-terracotta)] px-8 py-3.5 text-white font-semibold hover:bg-[color:var(--color-terracotta)]/90 transition-colors"
            >
              Ver anúncios com segurança <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="rounded-xl border border-[#185FA5]/20 bg-[#185FA5]/5 px-6 py-4 text-sm text-[#185FA5] flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>🔒 Sempre negocie pelo chat da plataforma</strong> — o histórico é preservado e serve como prova.{" "}
                <Link to="/compra-segura" className="underline underline-offset-2 hover:text-[#185FA5]/80">
                  Guia de compra segura
                </Link>
              </span>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
