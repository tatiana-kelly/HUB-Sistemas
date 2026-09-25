import {
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  ClipboardList,
  Coins,
  FileText,
  Gauge,
  LayoutGrid,
  LineChart,
  Map,
  Package,
  Radar,
  Route,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

/**
 * Vocabulário de ícones do portal — um único traço (lucide, 1.75) para toda a
 * interface. O campo `icon` guarda a chave, então o administrador escolhe o
 * ícone de um sistema novo sem precisar de deploy.
 */
const ICONS: Record<string, LucideIcon> = {
  truck: Truck,
  route: Route,
  map: Map,
  package: Package,
  boxes: Boxes,
  warehouse: Warehouse,
  radar: Radar,
  'line-chart': LineChart,
  'bar-chart-3': BarChart3,
  gauge: Gauge,
  users: Users,
  briefcase: Briefcase,
  building: Building2,
  wallet: Wallet,
  coins: Coins,
  'file-text': FileText,
  clipboard: ClipboardList,
  shield: ShieldCheck,
  'layout-grid': LayoutGrid,
}

export const ICON_OPTIONS = Object.keys(ICONS)

export function SystemIcon({ icon, className = 'h-5 w-5' }: { icon: string | null; className?: string }) {
  const Icon = (icon && ICONS[icon]) || LayoutGrid
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />
}
