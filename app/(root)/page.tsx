
"use client"

import { useStoreModal } from "@/hooks/use-store-modal";
import { useEffect } from "react";

export default function SetupPage() {
    const { isOpen, onOpen } = useStoreModal();

    useEffect(() => {
        if (!isOpen) {
            onOpen();
        }
    }, [isOpen, onOpen])

    return (
        <main className="p-4">
            Root Page
        </main>
    );
}
