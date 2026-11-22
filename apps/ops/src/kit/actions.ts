'use server'

// Specimen stand-ins for the Sidebar's server-action props (/_kit only; the kit layout 404s in production).
// They do nothing: the specimen shows the controls, it never signs anyone out or pauses anything.

export async function kitSignOut(): Promise<void> {
  await Promise.resolve()
}

export async function kitPause(): Promise<void> {
  await Promise.resolve()
}
