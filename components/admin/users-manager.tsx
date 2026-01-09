"use client"

import { useState, useEffect } from "react"
import { getAdminUsers, sendMassReminder, type AdminUser } from "@/lib/admin-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Users } from "lucide-react"
import { toast } from "sonner"
import localFont from "next/font/local"

const avantiqueBold = localFont({
    src: "../../public/fonts/Avantique-Bold.otf",
})

export function UsersManager() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]) // Array of emails
    const [sending, setSending] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        const res = await getAdminUsers()
        if (res.success && res.users) {
            setUsers(res.users)
        } else {
            toast.error("Error al cargar usuarios")
        }
        setLoading(false)
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u.email).filter(e => e))
        }
    }

    const toggleUser = (email: string) => {
        if (selectedUsers.includes(email)) {
            setSelectedUsers(selectedUsers.filter(e => e !== email))
        } else {
            setSelectedUsers([...selectedUsers, email])
        }
    }

    const handleSendReminder = async () => {
        if (selectedUsers.length === 0) return

        if (!confirm(`¿Estás seguro de enviar un recordatorio a ${selectedUsers.length} usuarios?`)) return

        setSending(true)
        try {
            const res = await sendMassReminder(selectedUsers)
            if (res.success) {
                toast.success(`Enviados: ${res.sent}, Fallidos: ${res.failed}`)
            } else {
                toast.error("Error al enviar correos")
            }
        } catch (error) {
            toast.error("Error inesperado")
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/20" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className={`text-2xl text-white mb-2 ${avantiqueBold.className}`}>Usuarios Registrados</h2>
                    <p className="text-white/40 text-sm">Gestiona la base de datos de usuarios y envía notificaciones.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-white/60 text-sm">
                        Total: <span className="text-white font-mono ml-2">{users.length}</span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between bg-[#111] p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onCheckedChange={toggleSelectAll}
                        id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm text-white/60 cursor-pointer">
                        Seleccionar todos ({selectedUsers.length})
                    </label>
                </div>
                <Button
                    onClick={handleSendReminder}
                    disabled={selectedUsers.length === 0 || sending}
                    className="bg-[#3ffcff] hover:bg-[#3ffcff]/90 text-black font-medium"
                >
                    {sending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar Recordatorio ({selectedUsers.length})
                        </>
                    )}
                </Button>
            </div>

            {/* Users Table */}
            <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0a0a0a]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/60 uppercase tracking-wider text-xs font-medium">
                        <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Fecha Registro</th>
                            <th className="p-4">Último Acceso</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">
                                    <Checkbox
                                        checked={selectedUsers.includes(user.email)}
                                        onCheckedChange={() => toggleUser(user.email)}
                                    />
                                </td>
                                <td className="p-4 text-white font-medium">{user.email}</td>
                                <td className="p-4 text-white/40">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-white/40">
                                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
