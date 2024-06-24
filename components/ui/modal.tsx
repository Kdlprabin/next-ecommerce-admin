"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

interface ModalProps {
    onClose: () => void;
    title: string;
    description: string;
    isOpen: boolean;
    children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
    onClose,
    title,
    description,
    isOpen,
    children
}) => {
    const onChange = (open: boolean) => {
        if (!open) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <p>{description}</p>
                </DialogHeader>
                <div>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}