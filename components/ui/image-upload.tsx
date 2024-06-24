"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary"
import { ImagePlus, Trash } from "lucide-react";

interface ImageUploadProps {
    disabled: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value
}) => {

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, [])


    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    }




    if (!isMounted) {
        return null
    }

    return (<div>
        <div className="mb-4 flex items-center gap-4">
            {value.map(url => {
                return <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden" key={url}>
                    <div className="z-10 absolute right-1 top-1">
                        <Button onClick={() => onRemove(url)} variant={"destructive"} size={"icon"}>
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>
                    <Image
                        fill
                        className="object-cover"
                        alt="image"
                        src={url}
                    />
                </div>
            })}
        </div>
        <CldUploadWidget onUpload={onUpload} uploadPreset={"zel0zioe"}>
            {
                ({ open }) => {
                    const onClick = () => {
                        open();
                    }

                    return <Button
                        onClick={onClick}
                        disabled={disabled}
                        variant={"secondary"}
                        type="button"
                    >
                        <ImagePlus className="w-4 h-4 mr-2" />
                        Upload an Image
                    </Button>
                }
            }
        </CldUploadWidget>
    </div>)
}

export default ImageUpload;