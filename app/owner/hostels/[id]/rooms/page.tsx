'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaBed, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSnowflake, 
  FaToilet, 
  FaFemale, 
  FaMale, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff 
} from 'react-icons/fa';
import Link from 'next/link';
import { getSingleHostel, getHostelRooms, updateRoom, deleteRoom } from '@/src/services/hostelService';
import { Hostel, Room } from '@/src/types';
import toast from 'react-hot-toast';
import ImageGallery from '@/src/components/common/ImageGallery';
import ConfirmationModal from '@/src/components/common/ConfirmationModal';

export default function RoomManagement() {
  const params = useParams();
  const id = params.id as string;

  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hostelData, roomsData] = await Promise.all([
        getSingleHostel(id),
        getHostelRooms(id)
      ]);
      setHostel(hostelData);
      setRooms(roomsData?.rooms || roomsData?.data || roomsData || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Could not load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleDeleteClick = (roomId: string) => {
    setRoomToDelete(roomId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;

    const roomId = roomToDelete;
    const previousRooms = [...rooms];
    
    // Optimistic Update
    setRooms(prev => prev.filter(r => r._id !== roomId));
    setIsDeleteModalOpen(false);
    setRoomToDelete(null);

    try {
      await deleteRoom(roomId);
      toast.success('Room deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      // Rollback
      setRooms(previousRooms);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const toggleStatus = async (room: Room) => {
    const newStatus = room.roomStatus === 'available' ? 'unavailable' : 'available';
    const previousStatus = room.roomStatus;

    // Optimistic Update
    setRooms(prev => prev.map(r => r._id === room._id ? { ...r, roomStatus: newStatus as any } : r));

    try {
      await updateRoom(room._id, { roomStatus: newStatus });
      toast.success(`Room status updated to ${newStatus === 'available' ? 'Available' : 'Unavailable'}`);
    } catch (error) {
      // Rollback
      setRooms(prev => prev.map(r => r._id === room._id ? { ...r, roomStatus: previousStatus as any } : r));
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-12 w-48 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-slate-100 rounded-[3rem] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/owner/hostels"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900">Room Management</h1>
            <p className="mt-1 text-slate-500">{hostel?.name} • {rooms.length} Variants</p>
          </div>
        </div>
        <Link 
          href={`/owner/hostels/${id}/rooms/create`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:scale-105 active:scale-95 text-center"
        >
          <FaPlus />
          <span>Add New Room Type</span>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Variants</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{rooms.length}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Capacity</p>
          <p className="mt-2 text-3xl font-black text-blue-600">{rooms.reduce((acc, r) => acc + (r.capacity || 0), 0)} Beds</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Male Available</p>
          <p className="mt-2 text-3xl font-black text-blue-500">{rooms.reduce((acc, r) => acc + (r.maleAvailableBeds || 0), 0)}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Female Available</p>
          <p className="mt-2 text-3xl font-black text-pink-500">{rooms.reduce((acc, r) => acc + (r.femaleAvailableBeds || 0), 0)}</p>
        </div>
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] bg-white py-24 shadow-sm">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-5xl text-blue-600">
            <FaBed />
          </div>
          <h2 className="text-3xl font-black text-slate-900">No Rooms Found</h2>
          <p className="mt-3 text-slate-500">Add different room types (1-in-1, 2-in-1, up to 8-in-1) to your hostel.</p>
          <Link 
            href={`/owner/hostels/${id}/rooms/create`}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            Create Your First Room Type
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room._id} className="group flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-sm transition-all hover:shadow-xl">
              {/* Image Preview */}
              <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100">
                <ImageGallery 
                  images={room.images || []} 
                  alt={room.roomType} 
                  showThumbnails={false}
                  height="h-full"
                  className="h-full"
                />
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black text-white shadow-md ${
                    room.roomStatus === 'available' ? 'bg-emerald-500' : 
                    room.roomStatus === 'unavailable' ? 'bg-red-500' : 'bg-amber-500'
                  }`}>
                    {room.roomStatus?.toUpperCase() || 'AVAILABLE'}
                  </span>
                  {room.hasAC && (
                    <span className="flex items-center gap-1 rounded-full bg-cyan-500 px-3 py-1 text-[10px] font-black text-white shadow-md">
                      <FaSnowflake /> AC
                    </span>
                  )}
                  {room.privateWashroom && (
                    <span className="flex items-center gap-1 rounded-full bg-purple-500 px-3 py-1 text-[10px] font-black text-white shadow-md">
                      <FaToilet /> PRIVATE
                    </span>
                  )}
                </div>
                
                <div className="absolute bottom-4 left-4 z-10">
                  <button 
                    onClick={() => toggleStatus(room)}
                    className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-[10px] font-black text-slate-900 backdrop-blur-sm transition hover:bg-white"
                  >
                    {room.roomStatus === 'available' ? <FaToggleOn className="text-emerald-500 text-sm" /> : <FaToggleOff className="text-slate-400 text-sm" />}
                    TOGGLE STATUS
                  </button>
                </div>

                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Link 
                    href={`/owner/hostels/${id}/rooms/edit/${room._id}`}
                    className="rounded-xl bg-white/90 p-2.5 text-blue-600 backdrop-blur-sm transition hover:bg-white hover:scale-110 active:scale-90"
                  >
                    <FaEdit />
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(room._id)}
                    className="rounded-xl bg-white/90 p-2.5 text-red-600 backdrop-blur-sm transition hover:bg-white hover:scale-110 active:scale-90"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">
                      GHS {room.price}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Per {room.billingPeriod}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-600">
                    {room.roomType}
                  </div>
                </div>

                <div className="mb-6 flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Capacity</p>
                      <p className="mt-1 text-xl font-black text-slate-900">{room.capacity} Beds</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Style</p>
                      <p className="mt-1 text-xl font-black text-slate-900">{room.occupancyStyle}</p>
                    </div>
                  </div>

                  {/* Gender and Availability Details */}
                  <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Availability</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        room.genderAllocation === 'Mixed' ? 'bg-purple-100 text-purple-700' :
                        room.genderAllocation === 'Female' ? 'bg-pink-100 text-pink-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {room.genderAllocation === 'Mixed' ? 'MIXED ROOM' : `${room.genderAllocation} ONLY`}
                      </span>
                    </div>

                    {room.genderAllocation === 'Mixed' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 text-[10px] font-black text-pink-500 uppercase">Females</span>
                          <span className="text-lg font-black">{room.femaleAvailableBeds || 0} left</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase">Males</span>
                          <span className="text-lg font-black">{room.maleAvailableBeds || 0} left</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase">
                          {room.genderAllocation === 'Female' ? 'Female' : 'Male'} Beds Available
                        </span>
                        <div className="flex items-end gap-2">
                          <span className={`text-2xl font-black ${room.availableBeds > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {room.availableBeds}
                          </span>
                          <span className="mb-1 text-xs font-bold text-slate-400">/ {room.capacity} total</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-4">
                  <Link 
                    href={`/hostels/${id}`}
                    target="_blank"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-200"
                  >
                    <FaEye /> PREVIEW
                  </Link>
                  <Link 
                    href={`/owner/hostels/${id}/rooms/edit/${room._id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 text-xs font-black text-blue-600 transition hover:bg-blue-100"
                  >
                    <FaEdit /> EDIT
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deletion Modal */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Room Type?"
        message="This will permanently remove this room variant and all associated data. This action cannot be undone."
        confirmText="Delete Room"
        loading={isDeleting}
      />
    </div>
  );
}
