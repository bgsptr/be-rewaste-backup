import { endOfDay, startOfDay, yearsToDays } from 'date-fns';
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { CustomBadRequest } from 'src/core/exceptions/custom-bad-request.exception';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

class DayConvertion {
  static getCurrent(): Dayjs {
    return dayjs();
  }

  private static validateCustomDate(dateString: string): boolean {
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    if (dayStr.length > 2 || yearStr.length > 4)
      throw new CustomBadRequest(`Invalid date string format: ${dateString}`);

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day >= 32) return false;

    const date = dayjs(`${year}-${month}-${day}`, 'YYYY-MM-DD', true);
    return date.isValid();
  }

  static getTargetDateFromString(dateString: string): Date {
    const format = 'YYYY-MM-DD';
    const dayjsObject = dayjs(dateString, format, true);
    if (!this.validateCustomDate(dateString)) {
      throw new CustomBadRequest(`Invalid date string format: ${dateString}`);
    }
    return dayjsObject.toDate();
  }

  static getTarget(target: Date): Dayjs {
    return dayjs(target);
  }

  static getDiffOfYear(now: Dayjs, target: Dayjs): number {
    return now.diff(target, 'year');
  }

  static getDiffOfMonth(now: Dayjs, target: Dayjs, years: number): number {
    const adjustedTarget = target.add(years, 'year');
    return now.diff(adjustedTarget, 'month');
  }

  static getStartAndEndForToday(selectedDateOrNow: Date = new Date()): {
    todayStart: Date;
    todayEnd: Date;
  } {
    const todayStart = startOfDay(selectedDateOrNow);
    const todayEnd = endOfDay(selectedDateOrNow);

    return {
      todayStart,
      todayEnd,
    };
  }
}

export default DayConvertion;
