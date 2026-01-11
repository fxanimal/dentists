import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format, addDays, startOfDay, endOfDay } from "date-fns";

interface CalendarViewProps {
  onSelectDateTime: (dateTime: Date) => void;
}

export default function CalendarView({ onSelectDateTime }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekStart = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Get available slots for the selected week
  const { data: slots = [], isLoading } = trpc.appointments.getAvailableSlots.useQuery(
    {
      startDate: startOfDay(weekStart),
      endDate: endOfDay(addDays(weekStart, 6)),
    },
    { enabled: true }
  );

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, typeof slots> = {};
    slots.forEach((slot) => {
      const dateKey = format(new Date(slot.slotDateTime), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    return grouped;
  }, [slots]);

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
    setSelectedDate(null);
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
    setSelectedDate(null);
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevWeek}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold">
          {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const daySlots = slotsByDate[dateKey] || [];
          const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateKey;
          const isPast = day < new Date();

          return (
            <div
              key={dateKey}
              className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : isPast
                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  : daySlots.length > 0
                  ? "border-gray-200 hover:border-blue-300"
                  : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
              }`}
              onClick={() => {
                if (!isPast && daySlots.length > 0) {
                  setSelectedDate(day);
                }
              }}
            >
              <div className="font-semibold text-sm">{format(day, "EEE")}</div>
              <div className="text-lg font-bold">{format(day, "d")}</div>
              <div className="text-xs text-gray-600 mt-1">
                {daySlots.length > 0 ? `${daySlots.length} slots` : "No slots"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Slots for Selected Date */}
      {selectedDate && (
        <div>
          <h3 className="font-semibold mb-3">
            Available times for {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {isLoading ? (
              <div className="col-span-4 text-center py-4 text-gray-500">
                Loading available times...
              </div>
            ) : (
              slotsByDate[format(selectedDate, "yyyy-MM-dd")]?.map((slot) => (
                <Button
                  key={slot.id}
                  variant="outline"
                  className="hover:bg-blue-50 hover:border-blue-600"
                  onClick={() => {
                    const slotDateTime = new Date(slot.slotDateTime);
                    onSelectDateTime(slotDateTime);
                  }}
                >
                  {format(new Date(slot.slotDateTime), "h:mm a")}
                </Button>
              )) || (
                <div className="col-span-4 text-center py-4 text-gray-500">
                  No available times for this date
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
