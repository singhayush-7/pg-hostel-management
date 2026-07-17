import { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Edit2,
  Trash2,
  ChevronRight,
  Wifi,
  Wind,
  Utensils,
  Shield,
  Car,
  Dumbbell,
  Zap,
  Droplets,
  Camera,
  WashingMachine,
} from 'lucide-react';

const AMENITY_ICONS = {
  WiFi: Wifi,
  AC: Wind,
  Food: Utensils,
  Parking: Car,
  CCTV: Camera,
  Laundry: WashingMachine,
  Gym: Dumbbell,
  'Power Backup': Zap,
  'Water Purifier': Droplets,
  'Security Guard': Shield,
};

const TYPE_LABELS = {
  pg: 'PG',
  hostel: 'Hostel',
  'co-living': 'Co-living',
};

const GENDER_COLORS = {
  male: 'badge-primary',
  female: 'badge-secondary',
  any: 'badge-success',
};

const GENDER_LABELS = {
  male: '♂ Male',
  female: '♀ Female',
  any: '⚥ Any',
};

export default function PropertyCard({ property, onEdit, onDelete, onManageRooms }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    _id,
    name,
    type,
    city,
    area,
    gender,
    photos = [],
    amenities = [],
    isActive,
    totalRooms = 0,
    availableRooms = 0,
  } = property;

  const coverPhoto = photos[0]?.url || null;
  const visibleAmenities = amenities.slice(0, 3);
  const extraAmenities = amenities.length - 3;
  const occupancyPercent =
    totalRooms > 0
      ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100)
      : 0;

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(_id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="card-hover animate-fade-in flex flex-col overflow-hidden group bg-white border border-border">
     
      <div className="relative h-48 flex-shrink-0 overflow-hidden bg-surface-100">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
            <Building2 className="w-12 h-12 text-primary-200" />
          </div>
        )}

   
        <div className="absolute top-3 left-3">
          <span className={`badge shadow-sm ${isActive ? 'badge-success bg-white/90 backdrop-blur-sm' : 'badge-danger bg-white/90 backdrop-blur-sm'}`}>
            {isActive ? '● Active' : '○ Inactive'}
          </span>
        </div>

 
        {photos.length > 0 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-surface-900/60 backdrop-blur-md text-xs font-medium text-white shadow-sm flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            {photos.length}
          </div>
        )}
      </div>

      
      <div className="flex flex-col flex-1 p-5 gap-4">
       
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-neutral bg-surface-50 text-surface-600 border-surface-200">
            {TYPE_LABELS[type?.toLowerCase()] || type}
          </span>
          <span className={`badge ${GENDER_COLORS[gender?.toLowerCase()] || 'badge-neutral'}`}>
            {GENDER_LABELS[gender?.toLowerCase()] || gender}
          </span>
        </div>

      
        <div>
          <h3 className="text-lg font-bold text-surface-900 leading-snug line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-surface-500 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <span className="truncate">{area ? `${area}, ` : ''}{city}</span>
          </div>
        </div>

      
        {amenities.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {visibleAmenities.map((amenity) => {
              const Icon = AMENITY_ICONS[amenity];
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-50 border border-border text-xs font-medium text-surface-600"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-primary-500" />}
                  {amenity}
                </span>
              );
            })}
            {extraAmenities > 0 && (
              <span className="text-xs font-medium text-surface-400">
                +{extraAmenities} more
              </span>
            )}
          </div>
        )}

      
        <div className="space-y-2 mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-surface-700">
              <Users className="w-4 h-4 text-surface-400" />
              Occupancy
            </span>
            <span className="font-semibold text-surface-900">
              {availableRooms}/{totalRooms} <span className="text-surface-500 font-normal">vacant</span>
            </span>
          </div>
          <div className="h-2 w-full bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                occupancyPercent >= 90
                  ? 'bg-danger-500'
                  : occupancyPercent >= 70
                  ? 'bg-warning-500'
                  : 'bg-success-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        
        <div className="flex items-center gap-2 pt-2">
          
          <button
            onClick={() => onManageRooms(_id)}
            className="btn-primary flex-1 py-2.5 shadow-sm"
          >
            Manage Rooms
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </button>

          
          <button
            onClick={() => onEdit(_id)}
            title="Edit property"
            className="w-10 h-10 rounded-xl border border-border bg-white hover:bg-surface-50 hover:border-surface-300 text-surface-500 hover:text-surface-900 flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          
          <button
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Click again to confirm' : 'Delete property'}
            className={`w-10 h-10 rounded-xl border shadow-sm flex items-center justify-center transition-all duration-200 font-semibold ${
              confirmDelete
                ? 'border-danger-200 bg-danger-50 text-danger-600 animate-pulse'
                : 'border-border bg-white hover:bg-danger-50 hover:border-danger-200 text-surface-500 hover:text-danger-600'
            }`}
          >
            {confirmDelete ? '!' : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
