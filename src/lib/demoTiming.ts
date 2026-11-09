// Timeline coordinates remain unchanged; one real second advances 1.5 demo seconds.
export const DEMO_PLAYBACK_SPEED = 1.5;

// Two 1.5-second pulses before processing starts.
export const FIRST_CONNECTION_PULSE_SECONDS = 1.5;
export const INITIAL_STAGE_MS = FIRST_CONNECTION_PULSE_SECONDS * 2 * 1000;
export const NEXT_STAGE_MS = 4500 / DEMO_PLAYBACK_SPEED;
