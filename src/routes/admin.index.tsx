import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownRight, ArrowUpRight, FilePlus2, FileText, Flag, MessageSquare, ShieldAlert, Ban, CheckCircle2, DollarSign, AlertTriangle, UserPlus, Users, Wallet, UserPlus2,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

const WEEKLY_SIGNUPS = [
  { week: "S1", count: 12 }, { week: "S2", count: 18 }, { week: "S3", count: 15 },
  { week: "S4", count: 22 }, { week: "S5", count: 28 }, { week: "S6", count: 24 },
  { week: "S7", count: 31 }, { week: "S8", count: 38 },
];

const ACTIVITY = [
  { id: "a1", icon: FilePlus2, tone: "var(--color-terracotta-soft)", text: "Novo anúncio: Opala 1979", time: "há 3 minutos" },
  { id: "a2", icon: UserPlus2, tone: "var(--color-cat-complete)", text: "Novo usuário: Carlos M.", time: "há 12 minutos" },
  { id: "a3", icon: ShieldAlert, tone: "var(--color-terracotta-deep)", text: "Denúncia recebida: listing_14", time: "há 1 hora" },
  { id: "a4", icon: CheckCircle2, tone: "var(--color-cat-complete)", text: "Anúncio aprovado: Galaxie 1968", time: "há 2 horas" },
  { id: "a5", icon: DollarSign, tone: "var(--color-gold)", text: "Pagamento recebido: user_02 Premium", time: "há 3 horas" },
  { id: "a6", icon: AlertTriangle, tone: "var(--color-cat-todo)", text: "Flag de segurança: listing_11", time: "há 4 horas" },
  { id: "a7", icon: Ban, tone: "var(--color-terracotta-deep)", text: "Conta suspensa: user_07", time: "há 5 horas" },
  { id: "a8", icon: FilePlus2, tone: "var(--color-terracotta-soft)", text: "Novo anúncio: Kombi 1985", time: "há 6 horas" },
  { id: "a9", icon: UserPlus2, tone: "var(--color-cat-todo)", text: "Novo cadastro pendente: Roberto F.", time: "há 8 horas" },
  { id: "a10", icon: MessageSquare, tone: "var(--color-terracotta-soft)", text: "Artigo publicado: História do Opala", time: "há 1 dia" },
];

interface DeltaProps {
  value: string;
  positive?: boolean;
  neutral?: boolean;
}

function Delta({ value, positive = true, neutral = false }: DeltaProps) {
  if (neutral) return <p className="mt-1 text-xs text-muted-foreground">{value}</p>;
  return (
    <p className={`mt-1 inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-[color:var(--color-cat-complete)]" : "text-[color:var(--color-terracotta-deep)]"}`}>
      {positive
        ? <ArrowUpRight className="h-3 w-3" />
        : <ArrowDownRight className="h-3 w-3" />}
      {value}
    </p>
  );
}

function StatCard({
  label, value, delta, deltaPositive, deltaNeutral, icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  deltaNeutral?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[10px] border border-[color:var(--color-border-cream)] bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-serif text-3xl">{value}</p>
      {delta && (
        <Delta value={delta} positive={deltaPositive ?? true} neutral={deltaNeutral} />
      )}
    </div>
  );
}

function Dashboard() {
  const { listings } = useAppStore();

  const barData = [
    { name: "Completo", value: listings.filter((l) => l.category === "completo").length, color: "var(--color-cat-complete)" },
    { name: "Para fazer", value: listings.filter((l) => l.category === "fazer").length, color: "var(--color-cat-todo)" },
    { name: "Para peças", value: listings.filter((l) => l.category === "pecas").length, color: "var(--color-terracotta-deep)" },
  ];

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral da plataforma</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total anúncios" value={247} delta="+8% vs mês passado" deltaPositive icon={FileText} />
        <StatCard label="Anúncios ativos" value={189} delta="+12%" deltaPositive icon={TrendingUp} />
        <StatCard label="Usuários cadastrados" value="1.847" delta="+15%" deltaPositive icon={Users} />
        <StatCard label="Novos hoje" value={23} delta="+3 vs ontem" deltaNeutral icon={UserPlus} />
        <StatCard label="Denúncias abertas" value={5} delta="-2 vs semana" deltaPositive={false} icon={Flag} />
        <StatCard label="Receita do mês" value="R$ 2.371" delta="+22%" deltaPositive icon={Wallet} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[10px] border border-[color:var(--color-border-cream)] bg-card p-5">
          <h3 className="font-serif text-lg">Anúncios por categoria</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-cream)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b6b6b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b6b6b" />
                <Tooltip cursor={{ fill: "#f0ede5" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[10px] border border-[color:var(--color-border-cream)] bg-card p-5">
          <h3 className="font-serif text-lg">Novos cadastros (8 semanas)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_SIGNUPS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-cream)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#6b6b6b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b6b6b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-terracotta-soft)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--color-terracotta-soft)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[10px] border border-[color:var(--color-border-cream)] bg-card p-5">
        <h3 className="font-serif text-lg">Atividade recente</h3>
        <ul className="mt-4 divide-y divide-[color:var(--color-border-cream)]">
          {ACTIVITY.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: a.tone }} aria-hidden="true" />
                  {a.text}
                </span>
                <span className="ml-4 shrink-0 text-xs text-muted-foreground">{a.time}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
