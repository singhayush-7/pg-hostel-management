import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProperties, selectAllProperties, selectPropertyLoading } from '../../store/slices/propertySlice';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Building2, Users } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

export default function PropertySearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const properties = useSelector(selectAllProperties);
  const isLoading = useSelector(selectPropertyLoading);

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || '',
    gender: searchParams.get('gender') || ''
  });

  useEffect(() => {
    dispatch(fetchAllProperties());
  }, [dispatch]);

  const filteredProperties = properties.filter((p) => {
    if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.area && !p.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (!p.isActive) return false;
    return true;
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Find Your Perfect Stay</h1>
          <p className="text-surface-500 text-lg">Search through hundreds of verified PGs and Hostels.</p>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                name="name"
                placeholder="Property Name..."
                value={filters.name}
                onChange={handleFilterChange}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                name="city"
                placeholder="City..."
                value={filters.city}
                onChange={handleFilterChange}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                name="area"
                placeholder="Area..."
                value={filters.area}
                onChange={handleFilterChange}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="type" value={filters.type} onChange={handleFilterChange} className="input w-full">
              <option value="">All Types</option>
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
              <option value="coliving">Co-Living</option>
            </select>
            <select name="gender" value={filters.gender} onChange={handleFilterChange} className="input w-full">
              <option value="">All Genders</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
              <option value="any">Any</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <div key={property._id} className="card-hover overflow-hidden bg-white border border-border flex flex-col rounded-2xl cursor-pointer" onClick={() => navigate(`/properties/${property._id}`)}>
                  <div className="h-48 bg-surface-200 relative overflow-hidden">
                    {property.photos && property.photos.length > 0 ? (
                      <img src={property.photos[0].url} alt={property.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-50">
                        <Building2 className="w-12 h-12 text-primary-200" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 badge badge-primary shadow-sm bg-white/90 backdrop-blur-sm">
                      {property.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-surface-900 leading-tight line-clamp-1">{property.name}</h3>
                      <div className="flex items-center text-surface-500 text-sm mt-1 gap-1">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="truncate">{property.area ? `${property.area}, ` : ''}{property.city}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="badge badge-neutral text-xs">{property.gender === 'male' ? '♂ Male' : property.gender === 'female' ? '♀ Female' : '⚥ Any Gender'}</span>
                      <span className="badge badge-success text-xs">{property.availableRooms} rooms left</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                      <div className="text-sm font-semibold text-surface-700">
                         {property.amenities.length} Amenities
                      </div>
                      <button className="btn-primary py-1.5 px-4 text-sm" onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}`); }}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-surface-300">
                <Building2 className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-surface-900">No properties found</h3>
                <p className="text-surface-500">Try adjusting your search filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
