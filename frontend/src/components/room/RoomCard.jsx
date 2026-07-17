import { useState } from 'react';
import {
  Bed,
  Wifi,
  Wind,
  Utensils,
  Bath,
  Users,
  Edit2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

const STATUS_COLORS = {
  available: 'badge-success bg-success-50 text-success-600 border-success-200',
  occupied: 'badge-warning bg-warning-50 text-warning-600 border-warning-200',
  maintenance: 'badge-danger bg-danger-50 text-danger-600 border-danger-200',
};

const TYPE_LABELS = {
  single: 'Single Room',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
};

export default function RoomCard({ room, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    _id,
    roomNumber,
    floor,
    type,
    capacity = 1,
    availableBeds = 1,
    rent,
    deposit,
    isAC,
    hasWiFi,
    hasFood,
    hasAttachedBath,
    status = 'available',
    images = [],
  } = room;

  const coverImage = images[0]?.url || null;

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(_id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="card-hover animate-fade-in flex flex-col overflow-hidden bg-white border border-border group relative">
     
      <div className="absolute top-3 right-3 z-10">
        <span className={`badge shadow-sm capitalize ${STATUS_COLORS[status.toLowerCase()] || 'badge-neutral'}`}>
          {status}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row h-full">
       
        <div className="sm:w-2/5 h-48 sm:h-auto relative bg-surface-50 shrink-0 overflow-hidden border-b sm:border-b-0 sm:border-r border-border">
          {coverImage ? (
            <img
              src={coverImage}
              alt={`Room ${roomNumber}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
              <Bed className="w-10 h-10 text-primary-200 mb-2" />
              <span className="text-xs font-medium text-primary-300">No Image</span>
            </div>
          )}
        </div>

     
        <div className="flex flex-col flex-1 p-5 gap-3">
          
          
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-surface-900 leading-tight">
                Room {roomNumber}
              </h3>
              <p className="text-sm text-surface-500 font-medium">Floor {floor} · {TYPE_LABELS[type?.toLowerCase()] || type}</p>
            </div>
          </div>

         
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary-600">₹{rent}</span>
              <span className="text-sm font-medium text-surface-500">/mo</span>
            </div>
            <p className="text-xs text-surface-400 mt-0.5">Dep: ₹{deposit}</p>
          </div>

         
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className={`p-1.5 rounded-lg border ${isAC ? 'bg-primary-50 border-primary-100 text-primary-500' : 'bg-surface-50 border-border text-surface-300'}`} title="Air Conditioning">
              <Wind className="w-4 h-4" />
            </div>
            <div className={`p-1.5 rounded-lg border ${hasWiFi ? 'bg-primary-50 border-primary-100 text-primary-500' : 'bg-surface-50 border-border text-surface-300'}`} title="WiFi">
              <Wifi className="w-4 h-4" />
            </div>
            <div className={`p-1.5 rounded-lg border ${hasAttachedBath ? 'bg-primary-50 border-primary-100 text-primary-500' : 'bg-surface-50 border-border text-surface-300'}`} title="Attached Bath">
              <Bath className="w-4 h-4" />
            </div>
            <div className={`p-1.5 rounded-lg border ${hasFood ? 'bg-primary-50 border-primary-100 text-primary-500' : 'bg-surface-50 border-border text-surface-300'}`} title="Food Included">
              <Utensils className="w-4 h-4" />
            </div>
          </div>

         
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-sm font-medium text-surface-700">
              <Users className="w-4 h-4 text-surface-400" />
              <span>{availableBeds}/{capacity}</span>
              <span className="text-surface-400 font-normal">vacant</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(_id)}
                className="p-2 rounded-xl bg-surface-50 border border-border text-surface-500 hover:bg-white hover:text-surface-900 hover:border-surface-300 transition-colors shadow-sm"
                title="Edit Room"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className={`p-2 rounded-xl border shadow-sm transition-colors font-bold ${
                  confirmDelete 
                    ? 'bg-danger-50 border-danger-200 text-danger-600' 
                    : 'bg-surface-50 border-border text-surface-500 hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200'
                }`}
                title="Delete Room"
              >
                {confirmDelete ? '!' : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
