import { Injectable } from "@nestjs/common";
import { Pharmacy } from "../entities/pharmacy.schema";

@Injectable()
export class PharmacyHelper {
  isPharmacyOpen(pharmacy: Pharmacy): boolean {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayName = days[currentDay];

    const workingHours = pharmacy.workingHours[currentDayName];

    if (!workingHours || !workingHours.open || !workingHours.close) {
      return false;
    }

    // Parse opening and closing times
    const [openHour, openMinute] = workingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = workingHours.close.split(':').map(Number);

    // Convert to minutes since midnight for easier comparison
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;

    return currentTimeInMinutes >= openTimeInMinutes &&
      currentTimeInMinutes <= closeTimeInMinutes;
  }
}