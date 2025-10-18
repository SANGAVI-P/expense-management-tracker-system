import { startOfMonth, endOfMonth, format } from "date-fns";

/**
 * Returns the start and end dates of a given month/year in 'yyyy-MM-dd' format.
 * @param date The date object representing the month to query.
 */
export const getMonthRange = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};

/**
 * Generates a list of recent months for selection.
 */
export const getRecentMonths = (count: number = 6) => {
  const months = [];
  let currentDate = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMM yyyy"),
      date: date,
    });
  }
  return months;
};