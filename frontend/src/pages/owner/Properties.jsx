import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Building2, Home, CheckCircle2, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import PropertyCard from '../../components/property/PropertyCard';
import {
  fetchMyProperties,
  deleteProperty,
  selectMyProperties,
  selectPropertyLoading,
} from '../../store/slices/propertySlice';

 
function PropertySkeleton() {
  return (
    <div className="card overflow-hidden border-border p-0">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
        <div className="skeleton h-2 w-full rounded-full" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-9 flex-1 rounded-xl" />
          <div className="skeleton h-9 w-9 rounded-xl" />
          <div className="skeleton h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

 
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in card bg-white">
      <div className="w-24 h-24 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
        <Building2 className="w-10 h-10 text-primary-500" />
      </div>
      <h3 className="text-xl font-bold text-surface-900 mb-2">No properties yet</h3>
      <p className="text-surface-500 mb-8 max-w-sm">
        Add your first PG, hostel, or co-living space to start managing rooms and accepting tenants.
      </p>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Your First Property
      </button>
    </div>
  );
}
 
export default function Properties() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const properties = useSelector(selectMyProperties);
  const isLoading = useSelector(selectPropertyLoading);

  useEffect(() => {
    dispatch(fetchMyProperties());
  }, [dispatch]);

  
  const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
  const availableRooms = properties.reduce((sum, p) => sum + (p.availableRooms || 0), 0);

  const stats = [
    { label: 'Total Properties', value: properties.length, icon: Building2, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Total Rooms', value: totalRooms, icon: DoorOpen, color: 'text-secondary-600', bg: 'bg-secondary-50' },
    { label: 'Available Rooms', value: availableRooms, icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Occupied Rooms', value: totalRooms - availableRooms, icon: Home, color: 'text-warning-600', bg: 'bg-warning-50' },
  ];

   
  const handleAdd = () => navigate('/owner/properties/new');
  const handleEdit = (id) => navigate(`/owner/properties/${id}/edit`);
  const handleManageRooms = (id) => navigate(`/owner/properties/${id}/rooms`);

  const handleDelete = async (id) => {
    const result = await dispatch(deleteProperty(id));
    if (deleteProperty.fulfilled.match(result)) {
      toast.success('Property deleted successfully');
    } else {
      toast.error(result.payload || 'Failed to delete property');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Properties</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Manage your PGs, hostels, and co-living spaces
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

     
      {!isLoading && properties.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{value}</p>
                <p className="text-xs text-surface-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <PropertySkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageRooms={handleManageRooms}
            />
          ))}
        </div>
      )}
    </div>
  );
}
