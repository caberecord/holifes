'use client';

import React from 'react';
import { ImageUpload } from '../../ui/ImageUpload';
import { useParams } from 'next/navigation';

interface ImageUploadFieldProps {
    value: any;
    onChange: (value: any) => void;
    label?: string; // Optional label if passed from Puck
}

export const ImageUploadField = ({ value, onChange, label }: ImageUploadFieldProps) => {
    const params = useParams();
    const eventId = params?.id as string || 'general';

    return (
        <ImageUpload
            value={value}
            onChange={onChange}
            path={`events/${eventId}/uploads`}
            label={label}
        />
    );
};

