import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Award } from "lucide-react";
import BookingDialog from "@/components/BookingDialog";

export default function PatientBooking() {
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">🦷 Canuck Dentist</div>
          <div className="flex gap-4">
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Services</Button>
            <Button variant="ghost">Contact</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Smile, Our Priority
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional dental care in a comfortable, welcoming environment. 
            Book your appointment today and experience the difference.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            onClick={() => setShowBookingDialog(true)}
          >
            Book Appointment
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Expert Team</h3>
              <p className="text-gray-600">Experienced dentists dedicated to your care</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">Book appointments at your convenience</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quick Service</h3>
              <p className="text-gray-600">Efficient appointments without long waits</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quality Care</h3>
              <p className="text-gray-600">Latest technology and best practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">General Dentistry</h3>
            <p className="text-gray-600">
              Regular checkups, cleanings, and preventive care to maintain your oral health.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Cosmetic Dentistry</h3>
            <p className="text-gray-600">
              Teeth whitening, veneers, and other treatments to enhance your smile.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Emergency Care</h3>
            <p className="text-gray-600">
              Urgent dental treatment for pain relief and emergency situations.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
      />
    </div>
  );
}
