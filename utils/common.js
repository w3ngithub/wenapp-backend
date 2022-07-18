// Return start and end of week date as object
exports.dateInThisWeek = () => {
  const todayObj = new Date();
  const todayDate = todayObj.getDate();
  const todayDay = todayObj.getDay();

  // Get first date of week
  let firstDayOfWeek = new Date(todayObj.setDate(todayDate - todayDay));

  // Get the date part only
  firstDayOfWeek = firstDayOfWeek.toISOString().split('T')[0];

  // Get last date of week
  let lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

  // Get the date part only
  lastDayOfWeek = lastDayOfWeek.toISOString().split('T')[0];

  // Converting date to ISO format with resetting timezone for db data comparision
  firstDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek = new Date(lastDayOfWeek);

  return {
    firstDayOfWeek,
    lastDayOfWeek
  };
};

exports.todayTomorrowDate = () => {
  let todayDate = new Date();
  todayDate = todayDate.toISOString().split('T')[0];

  let tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  tomorrowDate = tomorrowDate.toISOString().split('T')[0];

  todayDate = new Date(todayDate);
  tomorrowDate = new Date(tomorrowDate);

  return {
    todayDate,
    tomorrowDate
  };
};

exports.todayDate = () => {
  let todayDate = new Date();
  todayDate = todayDate.toISOString().split('T')[0];

  return new Date(todayDate);
};

exports.fiscalYearDate = () => {
  const fiscalYearStartDate = '2022-07-15';
  const fiscalYearEndDate = '2023-7-14';
  return {
    fiscalYearStartDate,
    fiscalYearEndDate
  };
};
