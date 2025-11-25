'use client';

import { Render } from "@measured/puck";
import { config } from "../../puck.config";
import { useEffect, useState } from "react";

export function ClientRender({ data }: { data: any }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return <Render config={config} data={data} />;
}
