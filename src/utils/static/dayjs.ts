import { endOfDay, startOfDay } from "date-fns";
import * as dayjs from "dayjs";
import { Dayjs } from "dayjs";

class DayConvertion {
    static getCurrent(): Dayjs {
        return dayjs();
    }

    static getTargetDateFromString(dateString: string): Date {
        const dayjsObject = dayjs(dateString);
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

    static getStartAndEndForToday(selectedDateOrNow: Date = new Date()): { todayStart: Date, todayEnd: Date }  {
        const todayStart = startOfDay(selectedDateOrNow);
        const todayEnd = endOfDay(selectedDateOrNow);

        return {
            todayStart,
            todayEnd
        };
    }
}

export default DayConvertion;