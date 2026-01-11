import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, Users, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: todayAppointments = [] } = trpc.appointments.getTodayAppointments.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: pendingAppointments = [] } = trpc.appointments.getPendingAppointments.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: dentists = [] } = trpc.dentists.list.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const confirmedAppointments = todayAppointments.filter(
    (apt) => apt.status === "confirmed"
  );

  const noShowRate = todayAppointments.length > 0
    ? Math.round(
        (todayAppointments.filter((apt) => apt.status === "cancelled").length /
          todayAppointments.length) *
          100
      )
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage appointments and clinic operations</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-gray-500 mt-1">New appointments today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Confirmations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {pendingAppointments.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting patient confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Confirmed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {confirmedAppointments.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Confirmed appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                No-Show Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{noShowRate}%</div>
              <p className="text-xs text-gray-500 mt-1">Cancellation rate today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Confirmations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pending Confirmations</CardTitle>
              <CardDescription>
                Appointments awaiting patient confirmation via SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending confirmations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAppointments.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-start justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{apt.reason}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {format(new Date(apt.appointmentTime), "MMM d, yyyy h:mm a")}
                        </p>
                        <p className="text-xs text-gray-600">{apt.phoneNumber}</p>
                      </div>
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Dentists */}
          <Card>
            <CardHeader>
              <CardTitle>Active Dentists</CardTitle>
              <CardDescription>{dentists.length} dentists available</CardDescription>
            </CardHeader>
            <CardContent>
              {dentists.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No dentists configured</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dentists.map((dentist) => (
                    <div
                      key={dentist.id}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded"
                    >
                      <div>
                        <p className="font-semibold text-sm">{dentist.fullName}</p>
                        {dentist.specialization && (
                          <p className="text-xs text-gray-600">{dentist.specialization}</p>
                        )}
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Confirmed appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            {confirmedAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No confirmed appointments for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {confirmedAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{apt.reason}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(apt.appointmentTime), "h:mm a")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{apt.phoneNumber}</p>
                      {apt.notes && (
                        <p className="text-xs text-gray-600 mt-2 italic">{apt.notes}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


