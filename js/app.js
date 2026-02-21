'use strict';


//  DURUM DEĞİŞKENLERİ
//  API anahtarı localStorage'dan okunur,
//  şehirleri saklayan cityCache sol paneldeki son aramaları tutar.

let API_KEY   = localStorage.getItem('owm_api_key') || '';
let cityCache = {}; // { 'istanbul': { temp, icon, displayName } }

// Hava durumu ikonları — OpenWeatherMap ikon koduna göre emoji eşleştirmesi
const WEATHER_ICONS = {
  '01d':'☀️', '01n':'🌙',   // açık
  '02d':'⛅', '02n':'☁️',   // az bulutlu
  '03d':'☁️', '03n':'☁️',   // bulutlu
  '04d':'🌥️','04n':'🌥️',  // çok bulutlu
  '09d':'🌧️','09n':'🌧️',  // sağanak
  '10d':'🌦️','10n':'🌧️',  // yağmurlu
  '11d':'⛈️','11n':'⛈️',   // fırtınalı
  '13d':'❄️', '13n':'❄️',   // karlı
  '50d':'🌫️','50n':'🌫️',  // sisli
};

//  gün ve ay isimleri 
const DAYS   = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];


//  API KEY KAYDETME
//  Kullanıcı anahtarını girip tıklayınca
//  localStorage'a kaydeder ve ilk aramayı başlatır.

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) return;

  API_KEY = key;
  localStorage.setItem('owm_api_key', key);

  // API kurulum kutusunu gizle
  document.getElementById('apiSetup').classList.remove('visible');

  // Varsayılan şehirle başla
  document.getElementById('cityInput').value = 'Istanbul';
  fetchWeather();
}


//  YARDIMCI FONKSİYONLAR


// Yükleniyor animasyonunu göster/gizle
function showLoader(v) {
  const loader = document.getElementById('loader');
  loader.style.display = v ? 'flex' : 'none';
  if (v) {
    // Yüklenirken diğer alanları gizle
    document.getElementById('weatherPanel').style.display = 'none';
    document.getElementById('emptyState').style.display   = 'none';
    document.getElementById('mainError').style.display    = 'none';
  }
}

// Hata mesajını sağ panelde göster
function showError(msg) {
  const el = document.getElementById('mainError');
  el.textContent = msg;
  el.style.display = 'block';
}

// Unix timestamp + timezone offset'i Türkçe tarihe çevirir
// Örnek: formatDate(1708524000, 10800) → "Cmt, 21 Şubat 2026"
function formatDate(ts, tz = 0) {
  const d = new Date((ts + tz) * 1000);
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}


//  SOL PANEL — ŞEHİR GEÇMİŞİ LİSTESİ
//  cityCache'deki tüm şehirleri sol panele basar.
//  Aktif şehir mavi vurgulayabileyim, çarpıyla silebileyim

function updateCityList(activeCity) {
  const list   = document.getElementById('cityList');
  const cities = Object.keys(cityCache);

  // Henüz arama yapılmadıysa boş mesaj göster
  if (cities.length === 0) {
    list.innerHTML = '<li class="city-empty">Henüz arama yapılmadı</li>';
    return;
  }

  list.innerHTML = '';

  // En son aratılan en üstte görünsün diye diziyi tersine çevir
  [...cities].reverse().forEach(key => {
    const { temp, icon, displayName } = cityCache[key];
    const isActive = key === activeCity.toLowerCase();

    const li = document.createElement('li');
    li.className = 'city-item' + (isActive ? ' active' : '');

    li.innerHTML = `
      <div class="city-item-left">
        <span class="city-item-icon">${icon}</span>
        <div>
          <div class="city-item-name">${displayName}</div>
          <div class="city-item-temp">${temp}°C</div>
        </div>
      </div>
      <span class="city-item-remove" title="Kaldır">✕</span>
    `;

    // Şehre tıklayınca arama kutusunu doldur ve hava durumunu getir
    li.addEventListener('click', (e) => {
      if (e.target.classList.contains('city-item-remove')) return;
      document.getElementById('cityInput').value = displayName;
      fetchWeather();
    });

    // Çarpıya tıklayınca şehri önbellekten ve listeden sil
    li.querySelector('.city-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      delete cityCache[key];
      updateCityList(activeCity);
    });

    list.appendChild(li);
  });
}


//  ANA FETCH FONKSİYONU
//  OpenWeatherMap API'den anlık hava + 5 günlük
//  tahmin verilerini paralel olarak çeker.
//
//  pushHistory parametresi:
//  - true  → tarayıcı geçmişine yeni kayıt ekle
//  - false → geri/ileri tuşu kullanımında tekrar ekleme

async function fetchWeather(pushHistory = true) {
  // Kullanıcının yazdığı şehir adını al
  const inputCity = document.getElementById('cityInput').value.trim();
  if (!inputCity) return;

  // API key yoksa kurulum kutusunu göster
  if (!API_KEY) {
    document.getElementById('apiSetup').classList.add('visible');
    showError('Lütfen önce API key girin.');
    return;
  }

  // Tarayıcı geçmişine bu şehri ekle
  // URL: ?city=Istanbul — geri tuşuyla dönünce bu state okunur
  if (pushHistory) {
    history.pushState({ city: inputCity }, '', `?city=${encodeURIComponent(inputCity)}`);
  }

  showLoader(true);

  try {
    const BASE   = 'https://api.openweathermap.org/data/2.5';
    const params = `appid=${API_KEY}&units=metric&lang=tr`;

    // Promise.all ile iki isteği aynı anda gönder (daha hızlı)
    const [wRes, fRes] = await Promise.all([
      fetch(`${BASE}/weather?q=${encodeURIComponent(inputCity)}&${params}`),
      fetch(`${BASE}/forecast?q=${encodeURIComponent(inputCity)}&${params}`)
    ]);

    // 404 → şehir bulunamadı, diğerleri → API hatası
    if (!wRes.ok) {
      throw new Error(wRes.status === 404 ? 'Şehir bulunamadı.' : `API hatası (${wRes.status})`);
    }

    const wData = await wRes.json();
    const fData = await fRes.json();

    showLoader(false);

    // Kullanıcının yazdığı adı iletiyorum sağ panele 
    renderWeather(wData, fData, inputCity);

  } catch (err) {
    showLoader(false);
    showError(err.message);
  }
}


//  RENDER — EKRANA YAZMA
//  API'den gelen veriyi alıp tüm DOM
//  elementlerini doldurur.

function renderWeather(data, forecast, inputCity) {
  const panel = document.getElementById('weatherPanel');
  panel.style.display = 'flex';

  // Her yeni şehirde animasyonu sıfırla ve yeniden tetikle
  panel.style.animation = 'none';
  void panel.offsetWidth; // tarayıcıyı reflow'a zorla
  panel.style.animation = 'fadeIn 0.4s ease both';

  const icon = WEATHER_ICONS[data.weather[0].icon] || '🌡️';

  // Şehir adı: kullanıcının yazdığı, ilk harf büyük
  // "london" → "London", "ISTANBUL" → "ISTANBUL" (kullanıcı nasıl yazdıysa)
  const displayName = inputCity.charAt(0).toUpperCase() + inputCity.slice(1);

  // ── HERO BÖLÜMÜ ──
  document.getElementById('heroCity').textContent    = displayName;       // büyük şehir adı
  document.getElementById('heroCountry').textContent = data.sys.country;  // ülke kodu
  document.getElementById('heroDate').textContent    = formatDate(data.dt, data.timezone);
  document.getElementById('heroDesc').textContent    = data.weather[0].description; // "kapalı bulutlu gibi yazı
  document.getElementById('heroIcon').textContent    = icon;              //  emoji
  document.getElementById('heroTemp').textContent    = Math.round(data.main.temp);
  document.getElementById('heroFeels').textContent   = `Hissedilen ${Math.round(data.main.feels_like)}°C`;

  //  İSTATİSTİK ÇUBUĞU 
  document.getElementById('statHum').textContent   = data.main.humidity + '%';
  document.getElementById('statWind').textContent  = Math.round(data.wind.speed) + ' m/s';
  document.getElementById('statVis').textContent   = data.visibility
    ? (data.visibility / 1000).toFixed(1) + ' km'
    : '—';
  document.getElementById('statPress').textContent = data.main.pressure + ' hPa';

  // ── NEM BARI ──
  // 150ms gecikme: panel animasyonundan sonra bar dolsun, göze hoş gelsin
  const hum = data.main.humidity;
  document.getElementById('barVal').textContent = hum + '%';
  setTimeout(() => {
    document.getElementById('barFill').style.width = hum + '%';
  }, 150);

  // ── 5 GÜNLÜK TAHMİN ──
  // OpenWeatherMap ücretsiz planda 3 saatlik dilimler verir (40 kayıt).
  // Her gün için saat 12:00'a en yakın dilimi seç → temsili günlük sıcaklık vermiş olur 
  const days = {};
  for (const item of forecast.list) {
    const dateStr = new Date(item.dt * 1000).toLocaleDateString('tr');
    const hour    = new Date(item.dt * 1000).getHours();
    if (!days[dateStr] ||
        Math.abs(hour - 12) < Math.abs(new Date(days[dateStr].dt * 1000).getHours() - 12)) {
      days[dateStr] = item;
    }
  }

  const grid = document.getElementById('forecastGrid');
  grid.innerHTML = '';

  // İlk 5 günü render et
  Object.values(days).slice(0, 5).forEach((item, i) => {
    const date    = new Date(item.dt * 1000);
    const dayName = i === 0 ? 'Bug.' : DAYS[date.getDay()]; // ilk gün "Bugün"
    const ico     = WEATHER_ICONS[item.weather[0].icon] || '🌡️';

    const card = document.createElement('div');
    card.className = 'fc-card';
    card.style.animationDelay = `${i * 0.07}s`; // 0, 70ms, 140ms... sıralı açılış

    card.innerHTML = `
      <div class="fc-day">${dayName}</div>
      <div class="fc-icon">${ico}</div>
      <div class="fc-temp">${Math.round(item.main.temp)}°</div>
      <div class="fc-feels">${Math.round(item.main.feels_like)}°</div>
    `;
    grid.appendChild(card);
  });

  // Sol paneldeki şehir listesini güncelle
  // Cache key küçük harf, displayName gösterim için
  const cacheKey = inputCity.toLowerCase();
  cityCache[cacheKey] = { displayName, temp: Math.round(data.main.temp), icon };
  updateCityList(inputCity);

  // Mobilde arama yapılınca sidebar otomatik kapansın
  if (window.innerWidth < 680) {
    document.getElementById('sidebar').classList.remove('open');
  }
}


//  GERİ / İLERİ TUŞU DESTEĞİ (History API)
//  Kullanıcı tarayıcının geri/ileri tuşuna basınca
//  popstate tetiklenir. State'teki şehri yükle.

window.addEventListener('popstate', (e) => {
  if (e.state?.city) {
    document.getElementById('cityInput').value = e.state.city;
    fetchWeather(false); // geçmişe tekrar ekleme!
  }
});



//  Hamburger butona basınca sidebar aç/kapat.

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}


//  KLAVYE KISAYOLLARI

// Arama kutusunda Enter → hava durumunu getir
document.getElementById('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') fetchWeather();
});

// API key kutusunda Enter → kaydet
document.getElementById('apiKeyInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveApiKey();
});


//  BAŞLANGIÇ (IIFE — hemen çalışır)
//  Sayfa yüklenince:
//  1. API key yoksa kurulum ekranını göster
//  2. URL'de ?city= varsa o şehri yükle
//  3. Yoksa İstanbul'u varsayılan kullan

(function init() {
  if (!API_KEY) {
    document.getElementById('apiSetup').classList.add('visible');
    return;
  }

  // Paylaşılan link veya geri tuşuyla gelme durumu
  const urlCity = new URLSearchParams(window.location.search).get('city');
  if (urlCity) {
    document.getElementById('cityInput').value = urlCity;
    history.replaceState({ city: urlCity }, '', window.location.href);
    fetchWeather(false);
  } else {
    document.getElementById('cityInput').value = 'Istanbul';
    fetchWeather();
  }
})();