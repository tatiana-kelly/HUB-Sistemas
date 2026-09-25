import { redirect } from 'next/navigation'

/** A raiz não tem conteúdo próprio: o portal começa na home autenticada. */
export default function RootPage() {
  redirect('/home')
}
