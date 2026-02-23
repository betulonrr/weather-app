#  Hava Durumu Uygulaması

Neumorphism tasarım diliyle yapılmış, gerçek zamanlı hava durumu uygulamasıdır. Hover'da geçiş animasyonları, float eden hava ikonu ve staggered açılış animasyonlaıyla daha modern bir görünüme kavuştu.
Siteye linkten ulaşabilirsiniz.( https://betulonrr.github.io/weather-app/ )

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![API](https://img.shields.io/badge/OpenWeatherMap-API-orange?style=flat)

##  Özellikler

- **Anlık hava durumu** — sıcaklık, hissedilen sıcaklık, nem, rüzgar, görüş mesafesi
- **5 günlük tahmin** — her gün için emoji ikon ve sıcaklık
- **Neumorphism UI** — CSS custom properties ile tutarlı gölge sistemi
- **CSS Animasyonlar** — fadeUp, float, spinner keyframe animasyonları
- **Responsive tasarım** — mobil ve masaüstü uyumlu
- **localStorage** — API key oturum başında bir kez girilir, tarayıcı hatırlar

##  Kullanılan programlar

 HTML5 = Sayfa yapısı ve semantik işaretleme 
 CSS3 = Neumorphism gölgeleri, animasyonlar, responsive grid 
 Vanilla JavaScript = API istekleri, DOM manipülasyonu, localStorage 
 OpenWeatherMap API = Gerçek zamanlı hava ve 5 günlük tahmin verisi 
 Google Fonts = DM Sans + Fraunces font çifti 

## Kurulum & Kullanım

### 1. Repoyu klonla
```bash
git clone https://github.com/kullanici-adin/weather-app.git
cd weather-app
```

**VS Code kullanıyorsan:**
- `Live Server` extension'ını kur (Ritwick Dey)
- `index.html` dosyasına sağ tıkla → **Open with Live Server**



### 3. API Key al
- [openweathermap.org](https://openweathermap.org/api) adresine git
- Ücretsiz hesap oluştur
- API Keys sekmesinden key'ini kopyala
- Uygulamada çıkan kutucuğa yapıştır ve kaydederek kullanılabilir

> 

##  Proje Yapısı

```
weather-app/
├── index.html        # HTML yapısı
├── css/
│   └── style.css     # Neumorphism stilleri ve animasyonlar
├── js/
│   └── app.js        # API entegrasyonu ve DOM işlemleri
└── README.md
```

##  Tasarım Notları

Neumorphism'in temel prensibi uygulanarak aynı arka plan renginde iki zıt gölge kullanıyoruz

```css
/* Dışa çıkan (convex) görünüm */
--convex: 6px 6px 14px #a3b1c6, -6px -6px 14px #ffffff;

/* İçe gömülü (concave) görünüm — focus ve hover için */
--concave: inset 4px 4px 10px #a3b1c6, inset -4px -4px 10px #ffffff;
```

Hover durumunda convex → concave geçişi, elementin "basılıyor" hissini vermek amaçlandı 

