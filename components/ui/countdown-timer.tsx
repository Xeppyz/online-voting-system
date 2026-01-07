"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CountdownTimerProps {
    targetDate: string // ISO string
    title?: string
    onComplete?: () => void
}

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export function CountdownTimer({ targetDate, title = "Tiempo Restante", onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        if (!targetDate) return

        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                })
            } else {
                setIsExpired(true)
                if (onComplete) onComplete()
            }
        }

        // Calculate immediately
        calculateTimeLeft()

        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [targetDate, onComplete])

    if (isExpired) return null

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {title && (
                <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm uppercase tracking-[0.2em] text-white/70 font-medium"
                >
                    {title}
                </motion.h3>
            )}

            <div className="flex gap-4 sm:gap-6 text-center">
                <TimeUnit value={timeLeft.days} label="días" />
                <Separator />
                <TimeUnit value={timeLeft.hours} label="horas" />
                <Separator />
                <TimeUnit value={timeLeft.minutes} label="min" />
                <Separator />
                <TimeUnit value={timeLeft.seconds} label="seg" />
            </div>
        </div>
    )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={value}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                        className="block text-4xl sm:text-5xl md:text-6xl font-black tabular-nums text-white leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
                        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
                    >
                        {String(value).padStart(2, "0")}
                    </motion.span>
                </AnimatePresence>
            </div>
            <span className="text-xs sm:text-sm uppercase tracking-wider text-primary font-bold mt-2">
                {label}
            </span>
        </div>
    )
}

function Separator() {
    return (
        <div className="text-2xl sm:text-4xl text-white/20 font-light relative -top-3 sm:-top-5 self-center">
            :
        </div>
    )
}
