import { DatePickerDate, millisInADay } from '.';

export const getMonthBoundaries = ({
  year,
  month,
  timeZone,
}: {
  year: number;
  month: number;
  timeZone: string;
}) => ({
  startDate: new DatePickerDate({
    type: 'Specific',
    year,
    month,
    day: 1,
  }).getAsDate(timeZone),
  endDate: new Date(
    new DatePickerDate({
      type: 'Specific',
      year: month === 12 ? year + 1 : year,
      month: month === 12 ? 1 : month + 1,
      day: 1,
    })
      .getAsDate(timeZone)
      .getTime() - 1,
  ),
});

export const addADayToDate = (date: Date): Date =>
  new Date(date.getTime() + millisInADay);

export const subtractADayFromDate = (date: Date): Date =>
  new Date(date.getTime() - millisInADay);
