import {
  BarChart3,
  Briefcase,
  LayoutGrid,
  LineChart,
  Radar,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * Mapa de ícones disponíveis para cadastro. O campo `icon` do banco guarda a
 * chave — assim o administrador escolhe o ícone sem precisar de deploy.
 */
const ICONS: Record<string, LucideIcon> = {
  truck: Truck,
  radar: Radar,
  'line-chart': LineChart,
  'bar-chart-3': BarChart3,
  users: Users,
  wallet: Wallet,
  briefcase: Briefcase,
  'layout-grid': LayoutGrid,
}

export const ICON_OPTIONS = Object.keys(ICONS)

interface SystemIconProps {
  icon: string | null
  className?: string
}

export function SystemIcon({ icon, className = 'h-5 w-5' }: SystemIconProps) {
  const Icon = (icon && ICONS[icon]) || LayoutGrid
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />
}
