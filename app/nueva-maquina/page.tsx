"use client"

import { MachineForm } from "@/components/machine-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevaMaquinaPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center gap-3">
        <Link
          href="/inventario"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
            Nueva Maquinaria
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrar un nuevo equipo en el inventario
          </p>
        </div>
      </div>
      <MachineForm />
    </div>
  )
}
