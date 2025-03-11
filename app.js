// Перевірка, чи сайт запущений у Telegram Mini Apps
if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready(); // Ініціалізація Web App
  Telegram.WebApp.expand(); // Розгорнути Web App на весь екран

  // Отримуємо дані користувача
  const user = Telegram.WebApp.initDataUnsafe.user;
  const userId = user.id;
  const userName = user.first_name;
  const userUsername = user.username || 'немає юзернейму';

  // Елементи для відображення даних
  const myLocationElement = document.getElementById('myLocation');
  const partnerLocationElement = document.getElementById('partnerLocation');

  // Функція для отримання геолокації
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Отримуємо адресу за координатами (використовуємо OpenStreetMap Nominatim API)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name || 'Адресу не вдалося визначити';
              myLocationElement.textContent = address;
              sendDataToBot('Отримано геолокацію', address);
            });
        },
        (error) => {
          console.error('Помилка отримання геолокації:', error);
          myLocationElement.textContent = 'Геолокацію не вдалося визначити';
        }
      );
    } else {
      myLocationElement.textContent = 'Геолокація не підтримується';
    }
  }

  // Функція для відправки даних до Telegram бота
  function sendDataToBot(action, address) {
    const message = {
      userId: userId,
      userName: userName,
      action: action,
      address: address
    };
    Telegram.WebApp.sendData(JSON.stringify(message)); // Відправляємо дані
  }

  // Отримуємо геолокацію при завантаженні сторінки
  getLocation();

  // Кнопка "Почати заново"
  document.getElementById('restartButton').addEventListener('click', () => {
    sendDataToBot('Натиснута кнопка "Почати заново"', myLocationElement.textContent);
    alert('Все скинуто! Починаємо новий відлік.');
  });

  // Кнопка "Не цікавить"
  document.getElementById('notInterestedButton').addEventListener('click', () => {
    sendDataToBot('Натиснута кнопка "Не цікавить"', myLocationElement.textContent);
    alert('Дякуємо за відгук!');
  });
}
