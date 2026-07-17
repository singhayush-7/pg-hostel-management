import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, BedDouble, CheckCircle2, User, Wrench, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import RoomCard from '../../components/room/RoomCard';
import {
  fetchRoomsByProperty,
  deleteRoom,
  selectRooms,
  selectRoomLoading,
  clearRooms
} from '../../store/slices/roomSlice';
import {
  fetchPropertyById,
  selectCurrentProperty,
} from '../../store/slices/propertySlice';


function RoomSkeleton() {
  return (
    <div className="card overflow-hidden border-border p-0 flex flex-col sm:flex-row h-full">
      <div className="sm:w-2/5 h-48 sm:h-auto bg-surface-100 skeleton rounded-none" />
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="skeleton h-6 w-1/2 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-8 w-1/3 rounded mt-2" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-8 w-8 rounded-lg" />
        </div>
        <div className="skeleton h-4 w-full rounded mt-auto" />
      </div>
    </div>
  );
}

 
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in card bg-white">
      <div className="w-20 h-20 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
        <BedDouble className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="text-lg font-bold text-surface-900 mb-2">No rooms added yet</h3>
      <p className="text-surface-500 mb-8 max-w-sm">
        Start adding rooms to this property to manage inventory and tenants.
      </p>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add First Room
      </button>
    </div>
  );
}
 
export default function Rooms() {
  const { propertyId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const property = useSelector(selectCurrentProperty);
  const rooms = useSelector(selectRooms);
  const isLoading = useSelector(selectRoomLoading);

  useEffect(() => {
    dispatch(fetchPropertyById(propertyId));
    dispatch(fetchRoomsByProperty(propertyId));
    
    return () => {
      dispatch(clearRooms());
    };
  }, [dispatch, propertyId]);
 
  const stats = [
    { label: 'Total Rooms', value: rooms.length, icon: BedDouble, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Available', value: rooms.filter(r => r.status === 'available').length, icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Occupied', value: rooms.filter(r => r.status === 'occupied').length, icon: User, color: 'text-warning-600', bg: 'bg-warning-50' },
    { label: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length, icon: Wrench, color: 'text-danger-600', bg: 'bg-danger-50' },
  ];

 
  const handleAdd = () => navigate(`/owner/properties/${propertyId}/rooms/new`);
  const handleEdit = (roomId) => navigate(`/owner/properties/${propertyId}/rooms/${roomId}/edit`);
  
  const handleDelete = async (roomId) => {
    const result = await dispatch(deleteRoom(roomId));
    if (deleteRoom.fulfilled.match(result)) {
      toast.success('Room deleted successfully');
    } else {
      toast.error(result.payload || 'Failed to delete room');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
    
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/owner/properties" 
            className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-surface-50 flex items-center justify-center text-surface-500 hover:text-surface-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Rooms</h1>
            <p className="text-surface-500 text-sm mt-0.5">
              {property ? property.name : 'Loading property...'}
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

 
      {!isLoading && rooms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-surface-900">{value}</p>
                <p className="text-xs text-surface-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <RoomSkeleton key={i} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
