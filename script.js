// Дати
const startDate = new Date('2024-05-07'); // Дата початку відносин
const breakupDate = new Date('2024-11-02'); // Дата розставання
const now = new Date(); // Поточна дата

// Елементи DOM
const timeTogetherElement = document.getElementById('timeTogether');
const timeAfterBreakupElement = document.getElementById('timeAfterBreakup');
const distanceElement = document.getElementById('distance');
const myLocationElement = document.getElementById('myLocation');
const partnerLocationElement = document.getElementById('partnerLocation');
const restartButton = document.getElementById('restartButton');
const notInterestedButton = document.getElementById('notInterestedButton');

// Координати
let myCoords = null; // Твої координати
let partnerCoords = null; // Координати Дзвінки

// Функція для оновлення часу
function updateTime() {
  const now = new Date();

  // Час разом
  const timeTogether = breakupDate - startDate;
  const daysTogether = Math.floor(timeTogether / (1000 * 60 * 60 * 24));
  const hoursTogether = Math.floor((timeTogether % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesTogether = Math.floor((timeTogether % (1000 * 60 * 60)) / (1000 * 60));
  const secondsTogether = Math.floor((timeTogether % (1000 * 60)) / 1000);

  // Час після розставання
  const timeAfterBreakup = now - breakupDate;
  const daysAfterBreakup = Math.floor(timeAfterBreakup / (1000 * 60 * 60 * 24));
  const hoursAfterBreakup = Math.floor((timeAfterBreakup % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesAfterBreakup = Math.floor((timeAfterBreakup % (1000 * 60 * 60)) / (1000 * 60));
  const secondsAfterBreakup = Math.floor((timeAfterBreakup % (1000 * 60)) / 1000);

  // Оновлення DOM
  timeTogetherElement.textContent = `${daysTogether} дн ${hoursTogether} год ${minutesTogether} хв ${secondsTogether} с`;
  timeAfterBreakupElement.textContent = `${daysAfterBreakup} дн ${hoursAfterBreakup} год ${minutesAfterBreakup} хв ${secondsAfterBreakup} с`;
}

// Функція для отримання місцезнаходження
function getLocation(isMe) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        if (isMe) {
          myCoords = { lat: userLat, lon: userLon };
          const myAddress = await getAddress(userLat, userLon);
          myLocationElement.textContent = myAddress;
          sendDataToBot('Влад зайшов на сайт', myAddress);
        } else {
          partnerCoords = { lat: userLat, lon: userLon };
          const partnerAddress = await getAddress(userLat, userLon);
          partnerLocationElement.textContent = partnerAddress;
          sendDataToBot('Дзвінка зайшла на сайт', partnerAddress);
        }

        calculateDistance(); // Розрахунок відстані
      },
      (error) => {
        console.error('Помилка отримання місцезнаходження:', error);
        if (isMe) {
          myLocationElement.textContent = 'Помилка геолокації';
        } else {
          partnerLocationElement.textContent = 'Помилка геолокації';
        }
      }
    );
  } else {
    console.error('Геолокація не підтримується у вашому браузері.');
    if (isMe) {
      myLocationElement.textContent = 'Геолокація не підтримується';
    } else {
      partnerLocationElement.textContent = 'Геолокація не підтримується';
    }
  }
}

// Функція для отримання адреси за координатами
async function getAddress(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    if (data.address) {
      const { city, town, village, country } = data.address;
      return `${city || town || village || 'Невідомо'}, ${country || 'Невідомо'}`;
    }
    return 'Адресу не знайдено';
  } catch (error) {
    console.error('Помилка отримання адреси:', error);
    return 'Помилка отримання адреси';
  }
}

// Функція для розрахунку відстані
function calculateDistance() {
  if (myCoords && partnerCoords) {
    const R = 6371; // Радіус Землі в км
    const dLat = (partnerCoords.lat - myCoords.lat) * (Math.PI / 180);
    const dLon = (partnerCoords.lon - myCoords.lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(myCoords.lat * (Math.PI / 180)) * Math.cos(partnerCoords.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Відстань у км
    distanceElement.textContent = `${distance.toFixed(2)} км`;
  } else {
    distanceElement.textContent = 'Очікування координат...';
  }
}

// Функція для відправки даних до Telegram бота
function sendDataToBot(action, address) {
  if (window.Telegram && Telegram.WebApp) {
    const user = Telegram.WebApp.initDataUnsafe.user; // Дані користувача
    const message = (
      `Користувач ${user.first_name} (${user.username || 'немає юзернейму'}, id: ${user.id})\n` +
      `Дія: ${action}\n` +
      `Адреса: ${address}`
    );
    Telegram.WebApp.sendData(JSON.stringify({ message }));
  }
}

// Кнопка "Почати заново"
restartButton.addEventListener('click', () => {
  sendDataToBot('Натиснута кнопка "Почати заново"', myLocationElement.textContent);
  alert('Все скинуто! Починаємо новий відлік.');
});

// Кнопка "Не цікавить"
notInterestedButton.addEventListener('click', () => {
  sendDataToBot('Натиснута кнопка "Не цікавить"', myLocationElement.textContent);
  alert('Дякуємо за відгук!');
});

// Оновлення даних кожну секунду
setInterval(updateTime, 1000);
updateTime(); // Перше оновлення

// Отримання місцезнаходження при завантаженні сторінки
getLocation(true); // Отримати мої координати
