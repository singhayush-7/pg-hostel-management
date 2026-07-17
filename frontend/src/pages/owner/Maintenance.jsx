import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, updateTask, selectTasks, selectTasksLoading } from '../../store/slices/taskSlice';
import { Wrench, Calendar, Clock, CheckSquare, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Maintenance() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks) || [];
  const isLoading = useSelector(selectTasksLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    property: '',
    date: '',
    priority: 'Medium',
    status: 'Scheduled'
  });

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTask({ title: '', property: '', date: '', priority: 'Medium', status: 'Scheduled' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.property || !newTask.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await dispatch(createTask(newTask)).unwrap();
      toast.success('Maintenance task scheduled successfully');
      handleCloseModal();
    } catch (error) {
      toast.error(error || 'Failed to create task');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatch(updateTask({ id, status: newStatus })).unwrap();
      toast.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error || 'Failed to update task status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Maintenance & Tasks</h1>
          <p className="text-surface-500 text-sm mt-0.5">Schedule property repairs and routine checks</p>
        </div>
        <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          New Task
        </button>
      </div>

      {isLoading && tasks.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-border bg-surface-50 flex flex-col items-center justify-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Loading tasks...</h3>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-border bg-surface-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">No maintenance tasks scheduled</h3>
          <p className="text-surface-500 max-w-sm mb-6">Keep your properties in top shape by scheduling regular maintenance.</p>
          <button onClick={handleOpenModal} className="btn-secondary border-surface-300 shadow-sm">Schedule Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {tasks.map(task => (
              <div key={task._id} className="card p-5 border-border bg-white hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 ${task.priority === 'High' ? 'bg-danger-50 text-danger-500' : task.priority === 'Medium' ? 'bg-warning-50 text-warning-500' : 'bg-success-50 text-success-500'}`}>
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-surface-900">{(task._id).slice(-6).toUpperCase()}</span>
                      <span className="text-xs text-surface-500">• {new Date(task.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 leading-tight">{task.title}</h3>
                    <p className="text-sm text-surface-500 font-medium mt-1">
                      Property: <span className="text-surface-700">{task.property}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center sm:flex-col justify-between sm:items-end gap-3 sm:gap-2 border-t sm:border-0 border-border pt-4 sm:pt-0">
                   <select 
                     value={task.status}
                     onChange={(e) => handleStatusChange(task._id, e.target.value)}
                     className={`text-xs font-semibold border border-border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary-500/20 ${task.status === 'Scheduled' ? 'bg-surface-100 text-surface-700' : task.status === 'In Progress' ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'}`}
                   >
                     <option value="Scheduled">Scheduled</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Completed">Completed</option>
                   </select>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="card p-6 bg-white border-border">
              <h3 className="text-base font-bold text-surface-900 mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-surface-600">
                    <Calendar className="w-4 h-4 text-surface-500" /> Scheduled
                  </div>
                  <span className="font-bold text-surface-900">{tasks.filter(t => t.status === 'Scheduled').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-surface-600">
                    <Clock className="w-4 h-4 text-warning-500" /> In Progress
                  </div>
                  <span className="font-bold text-surface-900">{tasks.filter(t => t.status === 'In Progress').length}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-surface-600">
                    <CheckSquare className="w-4 h-4 text-success-500" /> Completed
                  </div>
                  <span className="font-bold text-surface-900">{tasks.filter(t => t.status === 'Completed').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-50">
              <h2 className="text-lg font-bold text-surface-900">Schedule New Task</h2>
              <button 
                onClick={handleCloseModal}
                className="text-surface-400 hover:text-surface-600 hover:bg-surface-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Task Title <span className="text-danger-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., Fix plumbing in Room 101" 
                    className="input w-full"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Property/Room <span className="text-danger-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., Sunrise Apartments - 101" 
                    className="input w-full"
                    value={newTask.property}
                    onChange={(e) => setNewTask({...newTask, property: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Date <span className="text-danger-500">*</span></label>
                  <input 
                    type="date" 
                    className="input w-full"
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-1">Priority</label>
                  <select 
                    className="input w-full"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Schedule Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
