// Timeline coordinates remain unchanged; one real second advances 2.5 demo seconds.
export const DEMO_PLAYBACK_SPEED = 2.5;

// Two short pulses before processing starts.
export const FIRST_CONNECTION_PULSE_SECONDS = 0.8;
export const INITIAL_STAGE_MS = FIRST_CONNECTION_PULSE_SECONDS * 2 * 1000;
export const NEXT_STAGE_MS = 4500 / DEMO_PLAYBACK_SPEED;
