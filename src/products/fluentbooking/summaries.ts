/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved, and fields a
 *  record doesn't carry are simply skipped. Field names are FluentBooking's
 *  documented database columns (developers.fluentbooking.com/database/schema:
 *  fcal_calendars, fcal_calendar_events, fcal_bookings, fcal_meta for
 *  availability). Booking and event records embed settings
 *  blobs and descriptions that would otherwise dominate a listing. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  booking_calendars: ['id', 'title', 'slug', 'user_id', 'type', 'status', 'event_type', 'created_at'],
  booking_events: ['id', 'calendar_id', 'title', 'slug', 'duration', 'status', 'type', 'event_type', 'location_type', 'created_at'],
  booking_meetings: ['id', 'event_id', 'calendar_id', 'host_user_id', 'group_id', 'first_name', 'last_name', 'email', 'status', 'payment_status', 'start_time', 'end_time', 'slot_minutes', 'location_details', 'created_at'],
  booking_availability: ['id', 'object_type', 'object_id', 'key', 'created_at'],
};
