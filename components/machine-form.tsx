"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Truck,
  Camera,
  Plus,
  Trash2,
  Pencil,
  Calculator,
  Save,
  X,
  ImageIcon,
} from "lucide-react"
import {
  addMachine,
  updateMachine,
  addExpense,
  removeExpense,
  updateExpense,
} from "@/lib/store"
import type { Machine, Expense } from "@/lib/store"
import { toast } from "sonner"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

interface MachineFormProps {
  machine?: Machine
}

export function MachineForm({ machine }: MachineFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!machine

  // Form state
  const [item, setItem] = useState(machine?.item || "")
  const [purchaseDate, setPurchaseDate] = useState(machine?.purchaseDate || new Date().toISOString().split("T")[0])
  const [purchasedBy, setPurchasedBy] = useState(machine?.purchasedBy || "")
  const [itemNumber, setItemNumber] = useState(machine?.itemNumber || "")
  const [serial, setSerial] = useState(machine?.serial || "")
  const [hours, setHours] = useState(machine?.hours || "")
  const [cost, setCost] = useState(machine?.cost?.toString() || "")
  const [transport, setTransport] = useState(machine?.transport?.toString() || "")
  const [location, setLocation] = useState(machine?.location || "")
  const [observations, setObservations] = useState(machine?.observations || "")
  const [saleStatus, setSaleStatus] = useState<"no_vendido" | "vendido" | "en_negociacion">(machine?.saleStatus || "no_vendido")
  const [salePrice, setSalePrice] = useState(machine?.salePrice?.toString() || "0")
  const [photo, setPhoto] = useState<string | null>(machine?.photo || null)
  const [expenses, setExpenses] = useState<Expense[]>(machine?.expenses || [])
  const [saving, setSaving] = useState(false)

  // Expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0])
  const [expenseDesc, setExpenseDesc] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")

  // Calculations
  const costNum = parseFloat(cost) || 0
  const transportNum = parseFloat(transport) || 0
  const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0)
  const totalCost = costNum + transportNum + expensesTotal
  const profit40 = totalCost * 0.4
  const minSalePrice = totalCost + profit40
  const salePriceNum = parseFloat(salePrice) || 0

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleAddExpense() {
    if (!expenseDesc || !expenseAmount) {
      toast.error("Complete todos los campos del gasto")
      return
    }

    if (editingExpense) {
      if (isEditing && machine) {
        try {
          await updateExpense(machine.id, editingExpense, {
            date: expenseDate,
            description: expenseDesc,
            amount: parseFloat(expenseAmount),
          })
        } catch {
          toast.error("Error al actualizar gasto")
          return
        }
      }
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense
            ? { ...e, date: expenseDate, description: expenseDesc, amount: parseFloat(expenseAmount) }
            : e
        )
      )
      setEditingExpense(null)
    } else {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        date: expenseDate,
        description: expenseDesc,
        amount: parseFloat(expenseAmount),
      }
      if (isEditing && machine) {
        try {
          const created = await addExpense(machine.id, { date: expenseDate, description: expenseDesc, amount: parseFloat(expenseAmount) })
          newExpense.id = created.id
        } catch {
          toast.error("Error al agregar gasto")
          return
        }
      }
      setExpenses((prev) => [...prev, newExpense])
    }

    setExpenseDate(new Date().toISOString().split("T")[0])
    setExpenseDesc("")
    setExpenseAmount("")
    setShowExpenseForm(false)
    toast.success(editingExpense ? "Gasto actualizado" : "Gasto agregado")
  }

  function handleEditExpense(expense: Expense) {
    setEditingExpense(expense.id)
    setExpenseDate(expense.date)
    setExpenseDesc(expense.description)
    setExpenseAmount(expense.amount.toString())
    setShowExpenseForm(true)
  }

  async function handleDeleteExpense(expenseId: string) {
    if (isEditing && machine) {
      try {
        await removeExpense(machine.id, expenseId)
      } catch {
        toast.error("Error al eliminar gasto")
        return
      }
    }
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
    toast.success("Gasto eliminado")
  }

  async function handleSubmit() {
    if (!item || !itemNumber) {
      toast.error("Complete los campos obligatorios: Item y Numero de Item")
      return
    }

    setSaving(true)

    const data = {
      item,
      purchaseDate,
      purchasedBy,
      itemNumber,
      serial,
      hours,
      cost: costNum,
      transport: transportNum,
      location,
      observations,
      saleStatus,
      salePrice: salePriceNum,
      photo,
      expenses,
    }

    try {
      if (isEditing && machine) {
        await updateMachine(machine.id, data)
        toast.success("Maquinaria actualizada correctamente")
        router.push(`/maquina/${machine.id}`)
      } else {
        const newMachine = await addMachine(data)
        toast.success("Maquinaria registrada correctamente")
        router.push(`/maquina/${newMachine.id}`)
      }
    } catch {
      toast.error("Error al guardar maquinaria")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Machine Info */}
        <div className="animate-fade-in-up lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Informacion del Equipo</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput label="Item *" value={item} onChange={setItem} placeholder="CAT 320 Excavadora" />
              <FieldInput label="Fecha de Compra" type="date" value={purchaseDate} onChange={setPurchaseDate} />
              <FieldInput label="Comprado por" value={purchasedBy} onChange={setPurchasedBy} placeholder="Juan Martinez" />
              <FieldInput label="Item #" value={itemNumber} onChange={setItemNumber} placeholder="EQ-001" />
              <FieldInput label="Serial" value={serial} onChange={setSerial} placeholder="CAT320-2024-78541" />
              <FieldInput label="Horas" value={hours} onChange={setHours} placeholder="3,200" />
              <FieldInput label="Costo Item (USD)" type="number" value={cost} onChange={setCost} placeholder="45000" />
              <FieldInput label="Transporte (USD)" type="number" value={transport} onChange={setTransport} placeholder="2500" />
              <FieldInput label="Ubicacion" value={location} onChange={setLocation} placeholder="Miami, FL" className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Observaciones</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  placeholder="Notas adicionales sobre el equipo..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Estado de Venta</label>
                <select
                  value={saleStatus}
                  onChange={(e) => setSaleStatus(e.target.value as typeof saleStatus)}
                  className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="no_vendido">No Vendido</option>
                  <option value="en_negociacion">En Negociacion</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
              {saleStatus === "vendido" && (
                <FieldInput label="Precio de Venta Real (USD)" type="number" value={salePrice} onChange={setSalePrice} placeholder="68000" />
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "100ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Gastos del Equipo</h2>
              </div>
              <button
                onClick={() => {
                  setShowExpenseForm(true)
                  setEditingExpense(null)
                  setExpenseDate(new Date().toISOString().split("T")[0])
                  setExpenseDesc("")
                  setExpenseAmount("")
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar Gasto
              </button>
            </div>

            {/* Expense form */}
            {showExpenseForm && (
              <div className="animate-scale-in mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="mb-3 grid gap-3 sm:grid-cols-3">
                  <FieldInput label="Fecha" type="date" value={expenseDate} onChange={setExpenseDate} />
                  <FieldInput label="Descripcion" value={expenseDesc} onChange={setExpenseDesc} placeholder="Cambio de filtros" />
                  <FieldInput label="Monto (USD)" type="number" value={expenseAmount} onChange={setExpenseAmount} placeholder="850" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddExpense}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {editingExpense ? "Actualizar" : "Guardar"}
                  </button>
                  <button
                    onClick={() => {
                      setShowExpenseForm(false)
                      setEditingExpense(null)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Expenses table */}
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                      <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descripcion</th>
                      <th className="pb-2 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Monto</th>
                      <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="group transition-colors hover:bg-accent/30">
                        <td className="py-2.5 pr-4 text-muted-foreground">{expense.date}</td>
                        <td className="py-2.5 pr-4 text-card-foreground">{expense.description}</td>
                        <td className="py-2.5 pr-4 text-right font-mono font-medium text-card-foreground">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border">
                      <td colSpan={2} className="py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Gastos
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-primary">
                        {formatCurrency(expensesTotal)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay gastos registrados</p>
            )}
          </div>
        </div>

        {/* Right: Photo + Cost Summary */}
        <div className="space-y-6">
          {/* Photo */}
          <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "50ms" }}>
            <div className="mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Foto del Equipo</h2>
            </div>
            <div
              className="group relative flex h-52 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 transition-all hover:border-primary/50 hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
            >
              {photo ? (
                <>
                  <img src={photo} alt="Foto del equipo" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/30">
                    <Camera className="h-6 w-6 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Click para cargar foto</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photo && (
              <button
                onClick={() => setPhoto(null)}
                className="mt-2 w-full rounded-lg bg-destructive/10 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                Eliminar foto
              </button>
            )}
          </div>

          {/* Cost Summary */}
          <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "150ms" }}>
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Resumen de Costos</h2>
            </div>
            <div className="space-y-3">
              <CostRow label="Costo Item" value={costNum} />
              <CostRow label="Transporte" value={transportNum} />
              <CostRow label="Total Gastos" value={expensesTotal} />
              <div className="border-t border-border pt-3">
                <CostRow label="Costo Total" value={totalCost} bold />
              </div>
              <CostRow label="Ganancia (40%)" value={profit40} className="text-primary" />
              <CostRow label="Precio Venta Min." value={minSalePrice} bold className="text-primary" />
              {saleStatus === "vendido" && (
                <>
                  <div className="border-t border-border pt-3">
                    <CostRow label="Precio Venta Real" value={salePriceNum} bold />
                  </div>
                  <CostRow
                    label="Ganancia Real"
                    value={salePriceNum - totalCost}
                    bold
                    className={salePriceNum - totalCost >= 0 ? "text-emerald-600" : "text-red-500"}
                  />
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="animate-fade-in-up flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            style={{ animationDelay: "200ms" }}
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? "Actualizar Maquinaria" : "Guardar Maquinaria"}
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

function CostRow({
  label,
  value,
  bold = false,
  className = "",
}: {
  label: string
  value: number
  bold?: boolean
  className?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? "font-semibold" : ""} text-muted-foreground`}>{label}</span>
      <span className={`font-mono text-sm ${bold ? "font-bold" : "font-medium"} ${className || "text-card-foreground"}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}
