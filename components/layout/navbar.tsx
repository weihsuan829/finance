"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LineChart, List, BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
    { name: "景氣總覽", href: "/", icon: LayoutDashboard },
    { name: "台灣景氣", href: "/taiwan", icon: LayoutDashboard },
    { name: "指標數據", href: "/indicators", icon: LineChart },
    { name: "市場風險", href: "/market", icon: LineChart },
    { name: "觀察清單", href: "/watchlist", icon: List },
    { name: "方法說明", href: "/methodology", icon: BookOpen },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md transition-all duration-300">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/50">
                        <LineChart className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        Cycle<span className="text-indigo-600 dark:text-indigo-400">Sight</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-300",
                                    pathname === item.href ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <ThemeToggle />

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-slate-950/95 border-l border-white/10 backdrop-blur-xl text-white">
                                <div className="flex flex-col gap-6 mt-10">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 text-lg font-medium transition-colors hover:text-indigo-300",
                                                pathname === item.href ? "text-indigo-400" : "text-slate-400"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
