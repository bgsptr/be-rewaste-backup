import * as dayjs from "dayjs";
import { Dayjs } from "dayjs";

class DayConvertion {
    static getCurrent(): Dayjs {
        return dayjs();
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
}

export default DayConvertion;