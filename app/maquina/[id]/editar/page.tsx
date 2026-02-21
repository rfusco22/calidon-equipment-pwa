"use client"

import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { fetchMachine } from "@/lib/store"
import type { Machine } from "@/lib/store"
import { MachineForm } from "@/components/machine-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditarMaquinaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: machine, isLoading, error } = useSWR<Machine>(
    id ? `/api/machines/${id}` : null,
    fetchMachine
  )

  if (error) {
    router.push("/inventario")
    return null
  }

  if (isLoading || !machine) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center gap-3">
        <Link
          href={`/maquina/${machine.id}`}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
            Editar Maquinaria
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{machine.item}</p>
        </div>
      </div>
      <MachineForm machine={machine} />
    </div>
  )
}
