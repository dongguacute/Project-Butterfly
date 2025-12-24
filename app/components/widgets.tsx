import { useState, useEffect } from 'react';
import gsap from 'gsap';

export function ClockWidget() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date(0));
  const [timezone, setTimezone] = useState<string>("UTC");

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const handleTimezoneChange = (e: CustomEvent<{ timezone: string }>) => {
      if (e.detail.timezone) {
        setTimezone(e.detail.timezone);
      }
    };

    window.addEventListener('city-timezone-change' as any, handleTimezoneChange);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('city-timezone-change' as any, handleTimezoneChange);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: timezone
    });
  };

  if (!mounted) {
    return (
      <div className="p-6 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl shadow-indigo-500/5 h-[160px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl shadow-indigo-500/5 group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-wider">当前时间</span>
        </div>
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
          {timezone.split('/').pop()?.replace('_', ' ')}
        </span>
      </div>
      <div className="text-4xl font-black text-gray-900 dark:text-white mb-2 font-mono tracking-tighter">
        {formatTime(time)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        {formatDate(time)}
      </div>
    </div>
  );
}

export function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState('上海');
  const [isSelecting, setIsSelecting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    condition: string;
    icon: string;
    loading: boolean;
    error: string | null;
  }>({
    temp: 0,
    condition: '正在加载...',
    icon: '⏳',
    loading: true,
    error: null
  });

  const fetchWeather = async (city: string) => {
    setWeatherData(prev => ({ ...prev, loading: true, error: null }));
    try {
      // 1. 使用 Open-Meteo Geocoding API 获取城市经纬度 (非常快且免 Key)
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('未找到该城市');
      }

      const { latitude, longitude, name: cityName } = geoData.results[0];

      // 2. 使用 Open-Meteo Forecast API 获取实时天气
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
      const data = await weatherRes.json();
      const current = data.current_weather;
      
      // Open-Meteo WMO Weather interpretation codes (WW)
      const getWeatherInfo = (code: number) => {
        if (code === 0) return { condition: '晴朗', icon: '☀️' };
        if (code <= 3) return { condition: '多云', icon: '⛅' };
        if (code <= 48) return { condition: '有雾', icon: '🌫️' };
        if (code <= 67) return { condition: '有雨', icon: '🌧️' };
        if (code <= 77) return { condition: '有雪', icon: '❄️' };
        if (code <= 82) return { condition: '阵雨', icon: '🌦️' };
        if (code <= 99) return { condition: '雷暴', icon: '⚡' };
        return { condition: '未知', icon: '🌤️' };
      };

      const info = getWeatherInfo(current.weathercode);

      setWeatherData({
        temp: Math.round(current.temperature),
        condition: info.condition,
        icon: info.icon,
        loading: false,
        error: null
      });

      // 广播时区更改事件给时间模块
      if (data.timezone) {
        window.dispatchEvent(new CustomEvent('city-timezone-change', { 
          detail: { timezone: data.timezone } 
        }));
      }

      // 如果搜索的是拼音或不规范名称，更新为官方名称
      if (selectedCity !== cityName) setSelectedCity(cityName);
    } catch (err) {
      setWeatherData(prev => ({ 
        ...prev, 
        loading: false, 
        error: '获取失败',
        condition: '未知城市',
        icon: '❓'
      }));
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const cities = ['上海', '北京', '广州', '深圳', '杭州', '成都'];

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      setSelectedCity(inputValue.trim());
      setIsSelecting(false);
      setInputValue('');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl shadow-indigo-500/5 group transition-all duration-300 relative overflow-hidden min-h-[140px] flex flex-col justify-center">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-orange-500 dark:text-orange-400">
          <svg className={`w-5 h-5 ${weatherData.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-wider">当地天气</span>
        </div>
        
        <button 
          onClick={() => setIsSelecting(!isSelecting)}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-orange-500 transition-colors"
          title="切换城市"
        >
          {isSelecting ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

      {isSelecting ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入城市名(中文/拼音)..."
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-orange-500/50 rounded-xl px-4 py-2 text-xs outline-none transition-all dark:text-white"
              autoFocus
            />
          </form>

          <div className="grid grid-cols-3 gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setIsSelecting(false);
                }}
                className={`text-[10px] py-1.5 rounded-lg transition-all ${
                  selectedCity === city 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`flex items-end justify-between transition-opacity duration-300 ${weatherData.loading ? 'opacity-50' : 'opacity-100'}`}>
          <div>
            <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
              {weatherData.error ? '--' : weatherData.temp}°C
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-[150px]">
              {selectedCity} · {weatherData.condition}
            </div>
          </div>
          <div className="text-5xl animate-bounce-slow">
            {weatherData.icon}
          </div>
        </div>
      )}
    </div>
  );
}
