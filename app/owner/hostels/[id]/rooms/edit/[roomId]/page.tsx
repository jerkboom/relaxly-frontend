'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import RoomForm from '@/src/components/owner/rooms/RoomForm';
import { getSingleRoom } from '@/src/services/hostelService';
import { Room } from '@/src/types';
import toast from 'react-hot-toast';

export default function EditRoomPage() {
  const params = useParams();
  const id = params.id as string;
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const data = await getSingleRoom(roomId);
        setRoom(data);
      } catch (error) {
        console.error('Failed to fetch room:', error);
        toast.error('Could not load room data');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-slate-900">Room not found</h2>
        <Link href={`/owner/hostels/${id}/rooms`} className="text-blue-600 hover:underline mt-4 block">
          Back to Room Management
        </Link>
      </div>
    );
  }

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
          <h1 className="text-4xl font-black text-slate-900">Edit Room Variant</h1>
          <p className="mt-1 text-slate-500">Update details for {room.roomType}.</p>
        </div>
      </div>

      <RoomForm hostelId={id} initialData={room} isEditing={true} />
    </div>
  );
}
