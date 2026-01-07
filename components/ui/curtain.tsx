"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import localFont from "next/font/local"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const avantiqueBold = localFont({
    src: "../../public/fonts/Avantique-Bold.otf",
})

export function Curtain() {
    const router = useRouter()
    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
    })

    useEffect(() => {
        // Buscar la fecha de inicio en supabase para el countdown
        const fetchDates = async () => {
            const supabase = createClient()
            const { data } = await supabase.from("app_settings").select("value").eq("key", "voting_start_date").single()

            if (data?.value) {
                const startDate = new Date(data.value)

                const timer = setInterval(() => {
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

                    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

                    setTimeLeft({
                        days: days.toString().padStart(2, "0"),
                        hours: hours.toString().padStart(2, "0"),
                        minutes: minutes.toString().padStart(2, "0"),
                        seconds: seconds.toString().padStart(2, "0"),
                    })
                }, 1000)
                return () => clearInterval(timer)
            }
        }

        fetchDates()
    }, [])

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
                    La votación inicia{" "}
                    <span
                        onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = "/admin"
                        }}
                        className="cursor-default hover:text-white transition-colors relative z-50 px-1"
                        title=""
                    >
                        en
                    </span>
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

                {/* Notify Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button
                        className={`bg-[#3ffcff] hover:bg-[#3ffcff]/90 text-black text-lg h-14 px-8 rounded-none min-w-[240px] ${avantiqueBold.className}`}
                        onClick={() => window.open('https://instagram.com/clikawards_nic', '_blank')}
                    >
                        <Bell className="w-5 h-5 mr-3 fill-black" />
                        Notificarme
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}

function TimeBlock({ value, label, isCyan = false }: { value: string, label: string, isCyan?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-4">
            <span className={`text-4xl sm:text-6xl font-medium tracking-tighter ${isCyan ? 'text-[#3ffcff]' : 'text-white'}`}>
                {value}
            </span>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isCyan ? 'text-[#3ffcff]' : 'text-[#3ffcff]'}`}>
                {label}
            </span>
        </div>
    )
}
