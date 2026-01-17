/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from "react";
import { logger } from '@/services/logger';
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Users,
  MapPin,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, useCreateEvent } from "@/hooks/use-data";
import { useEventsStore } from "@/stores/app-store";
import { useToast } from "@/components/ui/use-toast";

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function DashboardCalendar() {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const { selectedDate, setSelectedDate } = useEventsStore();
  const { toast } = useToast();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = useMemo(() => {
    const days: (Date | null)[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Add empty slots for days before the first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    return days;
  }, [currentMonth, currentYear]);

  const getEventsForDate = (date: Date | null) => {
    if (!date || !events) return [];
    return events.filter(e => {
      const eventDate = new Date(e.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const goToPrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim()) return;

    try {
      await createEvent.mutateAsync({
        title: newEventTitle,
        description: "",
        start_time: selectedDate.toISOString(),
        end_time: new Date(selectedDate.getTime() + 3600000).toISOString(),
        color: "#1A1A1A",
      });
      setNewEventTitle("");
      setShowAddModal(false);
    } catch (error) {
      logger.error(error, error);
    }
  };

  const todayEvents = getEventsForDate(new Date());

  return (
    <div className="flex-1 flex h-full px-10 py-8 overflow-hidden gap-8">
      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <CalendarIcon size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {MONTHS[currentMonth]} {currentYear}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 flex-1">
            {daysInMonth.map((date, index) => {
              const isToday = date?.toDateString() === new Date().toDateString();
              const isSelected = date?.toDateString() === selectedDate.toDateString();
              const dayEvents = getEventsForDate(date);

              return (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-start p-2 transition-all",
                    !date && "invisible",
                    date && "hover:bg-gray-50",
                    isToday && "bg-crextio-primary/20 hover:bg-crextio-primary/30",
                    isSelected && "ring-2 ring-crextio-dark"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium mb-1",
                    isToday ? "text-crextio-dark" : "text-gray-700"
                  )}>
                    {date?.getDate()}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 h-1.5 rounded-full bg-crextio-dark"
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Sidebar - Today's Events */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-96 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Aujourd'hui" 
              : selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            }
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 bg-crextio-dark text-white rounded-lg flex items-center justify-center hover:bg-black transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {getEventsForDate(selectedDate).length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun événement</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm text-crextio-dark hover:underline"
              >
                + Ajouter un événement
              </button>
            </div>
          ) : (
            getEventsForDate(selectedDate).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                style={{ borderLeftWidth: 4, borderLeftColor: event.color }}
              >
                <h3 className="font-medium text-gray-900 mb-2">{event.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {new Date(event.start_time).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {event.attendees.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{event.attendees.length}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Nouvel événement</h3>
              
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Titre de l'événement"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-crextio-primary"
                autoFocus
              />
              
              <p className="text-sm text-gray-500 mb-4">
                Date: {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!newEventTitle.trim() || createEvent.isPending}
                  className="flex-1 py-3 bg-crextio-dark text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createEvent.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Créer"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

