/* ==========================================================================
   Mock data — SINGLE SOURCE OF TRUTH for simulated detections.
   Dashboard, Live Monitoring, Detections, Violations, and Reports should
   all read from MOCK_DETECTIONS (and derive stats from it) rather than
   hardcoding their own numbers. No backend — this is a static array that
   simulates what a real detection pipeline would produce.

   SCOPE (important — do not expand without checking with the team):
   - The system only detects whether a person is wearing "School Uniform"
     as a single category. It does NOT distinguish blouse vs. polo,
     pants vs. skirt, or any other sub-type — a detection is simply
     'compliant' (in school uniform) or 'violation' (not in school
     uniform).
   - No ID lace detection. No footwear detection.
   - No student identification of any kind — there is no way for a
     camera to know who someone is, so records use a generic on-screen
     label ("Student 1", "Student 2", ...) rather than a real name or
     student number. Treat these as anonymous, unlinked detection
     events, not student records.
   - Single camera, fixed location: Main Gate. There is only ever one
     checkpoint in this simulation, so records do NOT carry a `location`
     field — don't add one, and don't build location filters/dropdowns
     on Live Monitoring, Detections, Reports, etc. If the project scope
     later adds more cameras, this is the file to revisit.

   Loaded as a plain script (no ES modules) so pages can open via
   file:// or a simple static server without CORS issues. Everything is
   attached to `window` so any page script can read it after this file
   loads first.
   ========================================================================== */

const CAMERA_LOCATION = 'Main Gate';

// status: 'compliant' (wearing school uniform) | 'violation' (not wearing
// school uniform) | 'pending' (detection unclear, needs manual review)
const MOCK_DETECTIONS = [
  {
    id: 'DTC-1001',
    label: 'Student 1',
    timestamp: '2026-08-18T07:12:00',
    status: 'compliant',
    confidence: 0.97,
  },
  {
    id: 'DTC-1002',
    label: 'Student 2',
    timestamp: '2026-08-18T07:15:00',
    status: 'violation',
    confidence: 0.91,
  },
  {
    id: 'DTC-1003',
    label: 'Student 3',
    timestamp: '2026-08-18T09:40:00',
    status: 'violation',
    confidence: 0.88,
  },
  {
    id: 'DTC-1004',
    label: 'Student 4',
    timestamp: '2026-08-18T10:05:00',
    status: 'compliant',
    confidence: 0.95,
  },
  {
    id: 'DTC-1005',
    label: 'Student 5',
    timestamp: '2026-08-18T10:22:00',
    status: 'pending',
    confidence: 0.52,
  },
  {
    id: 'DTC-1006',
    label: 'Student 6',
    timestamp: '2026-08-18T13:01:00',
    status: 'violation',
    confidence: 0.93,
  },
];

// Aggregate stats — Dashboard/Reports should compute these FROM
// MOCK_DETECTIONS rather than hardcoding, but a precomputed shape is
// provided here as a reference for what that summary should look like.
function getMockSummaryStats(detections) {
  const data = detections || MOCK_DETECTIONS;
  const total = data.length;
  const compliant = data.filter((d) => d.status === 'compliant').length;
  const violations = data.filter((d) => d.status === 'violation').length;
  const pending = data.filter((d) => d.status === 'pending').length;
  return {
    total,
    compliant,
    violations,
    pending,
    complianceRate: total ? Math.round((compliant / total) * 100) : 0,
  };
}

window.CAMERA_LOCATION = CAMERA_LOCATION;
window.MOCK_DETECTIONS = MOCK_DETECTIONS;
window.getMockSummaryStats = getMockSummaryStats;
