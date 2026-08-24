type InteractionListener = () => void;

const listeners = new Set<InteractionListener>();

/**
 * Broadcasts a real screen touch without becoming a responder itself. The
 * touched control keeps the gesture; Jinx merely learns that the user is back.
 */
export function notifyMascotInteraction(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeMascotInteraction(
  listener: InteractionListener
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
