'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import RoomForm from '@/src/components/owner/rooms/RoomForm';

export default function CreateRoomPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href={`/owner/hostels/${id}/rooms`}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900">Add Room Variant</h1>
          <p className="mt-1 text-slate-500">Create a new room type for your hostel.</p>
        </div>
      </div>

      <RoomForm hostelId={id} />
    </div>
  );
}
