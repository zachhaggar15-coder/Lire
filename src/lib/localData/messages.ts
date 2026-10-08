import type { WriteFailure } from "@/lib/localData/store";

/**
 * What to tell the reader when something could not be saved on the device.
 * Short, specific, and never claims the change happened.
 */
export function persistenceFailureMessage(reason: WriteFailure): string {
  switch (reason) {
    case "quota":
      return "Your device is out of storage, so that wasn't saved. Free up some space and try again.";
    case "unavailable":
      return "Sorlio can't save on this device right now — storage may be turned off or blocked for this site.";
    case "stale-identity":
      return "That wasn't saved because you've signed out or switched accounts.";
    default:
      return "That couldn't be saved on your device. Nothing was changed — please try again.";
  }
}
