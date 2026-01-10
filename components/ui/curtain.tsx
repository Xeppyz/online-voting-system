"use client"

import { Button } from "@/components/ui/button"
import { Bell, Check, UserPlus, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import localFont from "next/font/local"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { sendWelcomeEmail } from "@/lib/email-actions"
import { toast } from "sonner"

const avantiqueBold = localFont({
    src: "../../public/fonts/Avantique-Bold.otf",
})

interface CurtainProps {
    startDate?: string | Date | null
}

export function Curtain({ startDate: propStartDate }: CurtainProps) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [timeLeft, setTimeLeft] = useState(() => {
        // Helper to determine initial state helper
        if (propStartDate) {
            const start = new Date(propStartDate)
            if (!isNaN(start.getTime())) {
                const now = new Date()
                const diff = start.getTime() - now.getTime()
                if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                    return {
                        days: days.toString().padStart(2, "0"),
                        hours: hours.toString().padStart(2, "0"),
                        minutes: minutes.toString().padStart(2, "0"),
                        seconds: seconds.toString().padStart(2, "0"),
                    }
                }
            }
        }
        return {
            days: "00", hours: "00", minutes: "00", seconds: "00"
        }
    })

    useEffect(() => {
        const supabase = createClient()

        // Check current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })

        let timer: NodeJS.Timeout

        const calculateTimeLeft = (targetDate: Date) => {
            const now = new Date()
            const diff = targetDate.getTime() - now.getTime()

            if (diff <= 0) {
                return { days: "00", hours: "00", minutes: "00", seconds: "00" }
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            return {
                days: days.toString().padStart(2, "0"),
                hours: hours.toString().padStart(2, "0"),
                minutes: minutes.toString().padStart(2, "0"),
                seconds: seconds.toString().padStart(2, "0"),
            }
        }

        const startTimer = (startDate: Date) => {
            timer = setInterval(() => {
                const now = new Date()
                const diff = startDate.getTime() - now.getTime()

                if (diff <= 0) {
                    clearInterval(timer)
                    setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" })
                    // Force reload to bypass curtain via server check
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                    return
                }

                setTimeLeft(calculateTimeLeft(startDate))
            }, 1000)
        }

        if (propStartDate) {
            const start = new Date(propStartDate)
            if (!isNaN(start.getTime())) {
                startTimer(start)
            }
        } else {
            // Fallback: fetch date if not provided via props
            const fetchDates = async () => {
                const { data } = await supabase.from("app_settings").select("value").eq("key", "voting_start_date").single()

                if (data?.value) {
                    const startDate = new Date(data.value)
                    setTimeLeft(calculateTimeLeft(startDate)) // Update immediately after fetch
                    startTimer(startDate)
                }
            }
            fetchDates()
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [propStartDate])

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
            {/* Background radial similar to design */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-4xl px-4 text-center">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <img
                        src="/icon/ClikHFull.png"
                        alt="Clik Awards 2026"
                        className="h-20 md:h-24 w-auto object-contain"
                    />
                </motion.div>

                {/* Countdown Label */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white font-medium mb-8"
                >
                    EN MANTENIMIENTO
                </motion.p>

                {/* Countdown */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap sm:flex-nowrap justify-center items-start gap-4 sm:gap-6 mb-20"
                >
                    <TimeBlock value={timeLeft.days} label="Días" />
                    <div className="hidden sm:block text-4xl sm:text-5xl font-light text-white/20 mt-1">:</div>
                    <TimeBlock value={timeLeft.hours} label="Horas" />
                    <div className="hidden sm:block text-4xl sm:text-5xl font-light text-white/20 mt-1">:</div>
                    <TimeBlock value={timeLeft.minutes} label="Min" />
                    <div className="hidden sm:block text-4xl sm:text-5xl font-light text-white/20 mt-1">:</div>
                    <TimeBlock value={timeLeft.seconds} label="Seg" isCyan />
                </motion.div>

                {/* Notify/Register Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    {user ? (
                        <UserWelcomeBlock user={user} />
                    ) : (
                        <Button
                            className={`bg-[#3ffcff] hover:bg-[#3ffcff]/90 text-black text-lg h-14 px-8 rounded-none min-w-[240px] ${avantiqueBold.className}`}
                            onClick={() => router.push('/auth/login')}
                        >
                            <UserPlus className="w-5 h-5 mr-3 fill-black stroke-black" />
                            Pre-Registrarme
                        </Button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

function TimeBlock({ value, label, isCyan = false }: { value: string, label: string, isCyan?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-4">
            <span
                suppressHydrationWarning
                className={`text-4xl sm:text-6xl font-medium tracking-tighter ${isCyan ? 'text-[#3ffcff]' : 'text-white'}`}
            >
                {value}
            </span>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isCyan ? 'text-[#3ffcff]' : 'text-[#3ffcff]'}`}>
                {label}
            </span>
        </div>
    )
}

function UserWelcomeBlock({ user }: { user: User }) {
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSendEmail = async () => {
        if (!user.email) return
        setSending(true)
        try {
            const res = await sendWelcomeEmail(user.email)
            if (res.success) {
                setSent(true)
                toast.success("¡Correo enviado! Revisa tu bandeja de entrada.")
            } else {
                toast.error("Error al enviar el correo. Inténtalo más tarde.")
            }
        } catch (err) {
            toast.error("Ocurrió un error inesperado.")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 mb-2">
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Registro Confirmado
                </div>
            </div>

            {!sent ? (
                <Button
                    onClick={handleSendEmail}
                    disabled={sending}
                    className={`bg-white hover:bg-gray-200 text-black text-lg h-14 px-8 rounded-none min-w-[240px] transition-all ${avantiqueBold.className}`}
                >
                    {sending ? (
                        <span className="flex items-center gap-2">Enviando...</span>
                    ) : (
                        <>
                            <Mail className="w-5 h-5 mr-3" />
                            Enviarme recordatorio
                        </>
                    )}
                </Button>
            ) : (
                <Button
                    disabled
                    className={`bg-white/10 text-white/50 border border-white/10 text-lg h-14 px-8 rounded-none min-w-[240px] cursor-not-allowed ${avantiqueBold.className}`}
                >
                    <Check className="w-5 h-5 mr-3" />
                    ¡Correo Enviado!
                </Button>
            )}

            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
                Te notificaremos cuando inicie la votación
            </p>
        </div>
    )
}
