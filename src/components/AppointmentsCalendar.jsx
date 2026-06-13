import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Calendar,
  Clock,
  Phone,
  Mail,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_STYLES = {
  pending:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  confirmed: 'bg-green-500/20  text-green-400  border border-green-500/30',
  completed: 'bg-blue-500/20   text-blue-400   border border-blue-500/30',
  cancelled: 'bg-red-500/20    text-red-400    border border-red-500/30',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function parseBookingDate(dateStr) {
  if (!dateStr) return null;
  // Parse "YYYY-MM-DD" without timezone shift
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return new Date(dateStr);
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  const d = parseBookingDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Builds 42 cells (6 rows × 7 cols) for the given year/month
function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  // Trailing days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Leading days from next month to reach 42 cells
  let next = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, next++), isCurrentMonth: false });
  }

  return cells;
}

// ─── Tech Avatar ─────────────────────────────────────────────────────────────

function TechAvatar({ tech, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]';
  if (tech.photo) {
    return (
      <img
        src={tech.photo}
        alt={tech.name}
        className={`${dim} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <span
      className={`${dim} rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 leading-none`}
    >
      {getInitials(tech.name)}
    </span>
  );
}

// ─── Booking Chip ─────────────────────────────────────────────────────────────

function BookingChip({ booking, teamMembers, onClick }) {
  const status = booking.status?.toLowerCase() || 'pending';
  const chipStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const tech = teamMembers.find((t) => String(t.id) === String(booking.assignedTechId));

  return (
    <button
      onClick={onClick}
      title={`${booking.service_type} — ${booking.name}`}
      className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded flex items-center justify-between gap-1 transition-opacity hover:opacity-75 ${chipStyle}`}
    >
      <span className="truncate flex-1 leading-tight">{booking.service_type}</span>
      {tech && (
        <span className="shrink-0 w-4 h-4 rounded-full bg-primary/30 text-primary text-[8px] font-bold flex items-center justify-center leading-none">
          {getInitials(tech.name)}
        </span>
      )}
    </button>
  );
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────

function DayCell({ date, isCurrentMonth, bookings, teamMembers, today, onChipClick }) {
  const isToday = isSameDay(date, today);
  const visible = bookings.slice(0, 3);
  const overflow = bookings.length - 3;

  return (
    <div
      className={[
        'min-h-[100px] p-1.5 bg-card border border-border/50 flex flex-col gap-0.5',
        !isCurrentMonth ? 'opacity-40' : '',
        isToday ? 'ring-1 ring-inset ring-primary/60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Date number */}
      <div className="flex justify-end mb-0.5">
        {isToday ? (
          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
            {date.getDate()}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground px-0.5">{date.getDate()}</span>
        )}
      </div>

      {/* Booking chips */}
      <div className="flex flex-col gap-0.5 flex-1">
        {visible.map((booking) => (
          <BookingChip
            key={booking.id}
            booking={booking}
            teamMembers={teamMembers}
            onClick={() => onChipClick(booking)}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[9px] text-muted-foreground pl-1">+{overflow} more</span>
        )}
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ booking, teamMembers, onClose, onStatusChange, onTechAssign }) {
  const status = booking.status?.toLowerCase() || 'pending';
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const isConfirmedOrAbove = ['confirmed', 'completed'].includes(status);
  const assignedTech = teamMembers.find(
    (t) => String(t.id) === String(booking.assignedTechId)
  ) || null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'fixed z-50 bg-card overflow-y-auto',
          // Desktop: right-side drawer
          'md:top-0 md:right-0 md:h-screen md:w-[380px] md:border-l md:border-border md:rounded-none md:bottom-auto md:left-auto md:max-h-none',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl border-t border-border',
        ]
          .join(' ')}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                Booking #{booking.id}
              </p>
              <h3 className="text-base font-semibold text-foreground leading-tight truncate">
                {booking.name}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* ── Status badge ── */}
          <span
            className={`self-start text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${statusStyle}`}
          >
            {booking.status || 'Pending'}
          </span>

          {/* ── Client info rows ── */}
          <div className="flex flex-col gap-2">
            <InfoRow icon={<Mail className="h-3.5 w-3.5" />} value={booking.email} />
            <InfoRow icon={<Phone className="h-3.5 w-3.5" />} value={booking.phone} />
            <InfoRow icon={<Wrench className="h-3.5 w-3.5" />} value={booking.service_type} />
            <InfoRow
              icon={<Calendar className="h-3.5 w-3.5" />}
              value={formatDisplayDate(booking.preferred_date)}
            />
            <InfoRow
              icon={<Clock className="h-3.5 w-3.5" />}
              value={booking.preferred_time || '—'}
            />
          </div>

          {/* ── Project description ── */}
          {booking.project_description && (
            <div className="bg-background rounded-lg p-3 border border-border/50">
              <p className="text-[11px] font-medium text-foreground mb-1 uppercase tracking-wide">
                Project Details
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {booking.project_description}
              </p>
            </div>
          )}

          <div className="border-t border-border" />

          {/* ── Status changer ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Change Status</label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 text-sm bg-background">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="capitalize">{s}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Assign technician ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Assign Technician
            </label>
            <Select
              value={booking.assignedTechId ? String(booking.assignedTechId) : 'unassigned'}
              onValueChange={onTechAssign}
            >
              <SelectTrigger className="h-9 text-sm bg-background">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {teamMembers.map((tech) => (
                  <SelectItem key={tech.id} value={String(tech.id)}>
                    <div className="flex items-center gap-2">
                      <TechAvatar tech={tech} size="sm" />
                      <span>{tech.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assigned tech confirmation */}
            {assignedTech && (
              <div className="flex items-center gap-2 mt-1 px-1">
                <TechAvatar tech={assignedTech} size="md" />
                <span className="text-sm text-foreground">{assignedTech.name}</span>
                <span className="text-xs text-muted-foreground">— Assigned</span>
              </div>
            )}
          </div>

          {/* ── Auto-invoice note ── */}
          {isConfirmedOrAbove && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              <span className="text-xs text-green-400">
                Invoice auto-generated when job is scheduled
              </span>
            </div>
          )}

          {/* Bottom padding for mobile safe area */}
          <div className="h-2 md:hidden" />
        </div>
      </div>
    </>
  );
}

// Small helper for icon + text rows
function InfoRow({ icon, value }) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="break-words min-w-0">{value || '—'}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AppointmentsCalendar = ({ bookings = [], teamMembers = [], onUpdateBooking }) => {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 42-cell grid for the current month view
  const calendarDays = useMemo(() => buildCalendarDays(year, month), [year, month]);

  // Map "year-month-date" → [bookings] for O(1) day lookups
  const bookingsByDay = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const d = parseBookingDate(b.preferred_date);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  function getBookingsForDate(date) {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return bookingsByDay[key] || [];
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function handleChipClick(booking) {
    setSelectedBooking(booking);
  }

  function handleStatusChange(newStatus) {
    if (!selectedBooking) return;
    onUpdateBooking?.(selectedBooking.id, { status: newStatus });
    setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
  }

  function handleTechAssign(techId) {
    if (!selectedBooking) return;
    if (techId === 'unassigned') {
      onUpdateBooking?.(selectedBooking.id, { assignedTechId: null, assignedTechName: null });
      setSelectedBooking((prev) => ({ ...prev, assignedTechId: null, assignedTechName: null }));
    } else {
      const tech = teamMembers.find((t) => String(t.id) === String(techId));
      if (!tech) return;
      onUpdateBooking?.(selectedBooking.id, {
        assignedTechId: tech.id,
        assignedTechName: tech.name,
      });
      setSelectedBooking((prev) => ({
        ...prev,
        assignedTechId: tech.id,
        assignedTechName: tech.name,
      }));
    }
  }

  return (
    <div className="w-full bg-background rounded-xl border border-border overflow-hidden">
      {/* ── Month navigation ── */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-bold text-foreground min-w-[160px] text-center select-none">
          {MONTH_NAMES[month]} {year}
        </h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Day-of-week header ── */}
      <div className="grid grid-cols-7 border-b border-border bg-card">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-xs font-medium text-muted-foreground text-center uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => (
          <DayCell
            key={idx}
            date={date}
            isCurrentMonth={isCurrentMonth}
            bookings={getBookingsForDate(date)}
            teamMembers={teamMembers}
            today={today}
            onChipClick={handleChipClick}
          />
        ))}
      </div>

      {/* ── Booking detail panel ── */}
      {selectedBooking && (
        <DetailPanel
          booking={selectedBooking}
          teamMembers={teamMembers}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          onTechAssign={handleTechAssign}
        />
      )}
    </div>
  );
};

export default AppointmentsCalendar;
