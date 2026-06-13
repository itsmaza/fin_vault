"use client";
import { formatDateTime } from '@/utils';
import React from 'react';

export default function Datetime(date: Date | any) {
    return (
        <>
            <p className="text-[11px] text-[#8a9e96]">{formatDateTime(date)}</p>
        </>
    );
}
