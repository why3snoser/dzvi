// Укажи дату начала отношений
const startDate = new Date('2023-01-01'); // Замени на свою дату

function updateCounter() {
  const currentDate = new Date();
  const timeDiff = currentDate - startDate;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  document.getElementById('daysCounter').textContent = daysDiff;
}

// Обновляем счетчик при загрузке
updateCounter();