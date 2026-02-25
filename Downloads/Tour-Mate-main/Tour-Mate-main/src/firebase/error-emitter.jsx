'use client';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A strongly-typed pub/sub event emitter.
 */
function createEventEmitter() {
  // The events object stores arrays of callbacks, keyed by event name.
  const events = {};

  return {
    /**
     * Subscribe to an event.
     * @param eventName The name of the event to subscribe to.
     * @param callback The function to call when the event is emitted.
     */
    on(eventName, callback) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    /**
     * Unsubscribe from an event.
     * @param eventName The name of the event to unsubscribe from.
     * @param callback The specific callback to remove.
     */
    off(eventName, callback) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    /**
     * Publish an event to all subscribers.
     * @param eventName The name of the event to emit.
     * @param data The data payload that corresponds to the event's type.
     */
    emit(eventName, data) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

// Create and export a singleton instance of the emitter.
export const errorEmitter = createEventEmitter();
