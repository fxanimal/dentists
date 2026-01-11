import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import CalendarView from "./CalendarView";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = useState<"calendar" | "form">("calendar");
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    reason: "",
  });

  const bookingMutation = trpc.appointments.bookAppointment.useMutation({
    onSuccess: () => {
      toast.success("Appointment booked successfully! You will receive an SMS confirmation.");
      setStep("calendar");
      setSelectedDateTime(null);
      setFormData({ fullName: "", email: "", phone: "", reason: "" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Booking failed: ${error.message}`);
    },
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDateTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.reason) {
      toast.error("Please fill in all fields");
      return;
    }

    bookingMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      reason: formData.reason,
      appointmentTime: selectedDateTime,
      isNewPatient,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book Your Appointment</DialogTitle>
          <DialogDescription>
            {step === "calendar"
              ? "Select your preferred date and time"
              : "Enter your details to complete the booking"}
          </DialogDescription>
        </DialogHeader>

        {step === "calendar" ? (
          <div className="space-y-4">
            <CalendarView
              onSelectDateTime={(dateTime) => {
                setSelectedDateTime(dateTime);
                setStep("form");
              }}
            />
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Describe your dental concern..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="newPatient"
                checked={isNewPatient}
                onCheckedChange={(checked) =>
                  setIsNewPatient(checked as boolean)
                }
              />
              <Label htmlFor="newPatient" className="font-normal cursor-pointer">
                I'm a new patient
              </Label>
            </div>

            <div className="bg-blue-50 p-3 rounded text-sm text-gray-700">
              <strong>Selected:</strong> {selectedDateTime?.toLocaleString()}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("calendar");
                  setSelectedDateTime(null);
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={bookingMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
