import type { Track, Playlist } from '../types/music';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-4',
    title: 'Kesariya (From "Brahmastra")',
    artist: 'Arijit Singh & Pritam',
    album: 'Brahmastra Master Hits',
    duration: 268,
    audioUrl: 'https://aac.saavncdn.com/423/852ad6cc81d7733c5e9bfc46d7b063e2_320.mp4',
    youtubeId: 'BddP6PYo2gs',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#ea580c',
    secondaryColor: '#f97316',
    genre: 'Bollywood Romantic',
    year: 2026,
    plays: 5820000,
    lyrics: [
  {
    "time": 9.44,
    "text": "मुझको इतना बताए कोई"
  },
  {
    "time": 19.02,
    "text": "कैसे तुझसे दिल ना लगाए कोई?"
  },
  {
    "time": 29.91,
    "text": "रब्बा ने तुझको बनाने में"
  },
  {
    "time": 34.26,
    "text": "कर दी हैं हुस्न की ख़ाली तिजोरियाँ"
  },
  {
    "time": 40.36,
    "text": "काजल की सियाही से लिखी हैं तूने"
  },
  {
    "time": 45.35,
    "text": "जाने कितनों की लव-स्टोरियाँ"
  },
  {
    "time": 49.31,
    "text": "केसरिया तेरा इश्क़ है, पिया"
  },
  {
    "time": 54.27,
    "text": "रंग जाऊँ जो मैं हाथ लगाऊँ"
  },
  {
    "time": 58.32,
    "text": "दिन बीते सारा तेरी फ़िक्र में"
  },
  {
    "time": 63.09,
    "text": "रैन सारी तेरी ख़ैर मनाऊँ"
  },
  {
    "time": 69.93,
    "text": "केसरिया तेरा इश्क़ है, पिया"
  },
  {
    "time": 74.72,
    "text": "रंग जाऊँ जो मैं हाथ लगाऊँ"
  },
  {
    "time": 78.97,
    "text": "दिन बीते सारा तेरी फ़िक्र में"
  },
  {
    "time": 83.69,
    "text": "रैन सारी तेरी ख़ैर मनाऊँ"
  },
  {
    "time": 117.7,
    "text": "पतझड़ के मौसम में भी रंगीं चनारों जैसी"
  },
  {
    "time": 122.81,
    "text": "झनके सन्नाटों में तू वीना के तारों जैसी"
  },
  {
    "time": 132.43,
    "text": "Mmm, सदियों से भी लंबी ये मन की अमावसें हैं"
  },
  {
    "time": 138.13,
    "text": "और तू फुलझड़ियों वाले त्योहारों जैसी"
  },
  {
    "time": 142.2,
    "text": "चंदा भी दीवाना है तेरा"
  },
  {
    "time": 146.39,
    "text": "जलती हैं तुझसे सारी चकोरियाँ"
  },
  {
    "time": 152.56,
    "text": "काजल की सियाही से लिखी हैं तूने"
  },
  {
    "time": 157.56,
    "text": "जाने कितनों की लव-स्टोरियाँ (लव-स्टोरियाँ)"
  },
  {
    "time": 164.24,
    "text": "केसरिया तेरा इश्क़ है, पिया"
  },
  {
    "time": 169.21,
    "text": "रंग जाऊँ जो मैं हाथ लगाऊँ"
  },
  {
    "time": 173.27,
    "text": "दिन बीते सारा तेरी फ़िक्र में"
  },
  {
    "time": 178.21,
    "text": "रैन सारी तेरी ख़ैर मनाऊँ"
  },
  {
    "time": 184.82,
    "text": "केसरिया तेरा इश्क़ है, पिया"
  },
  {
    "time": 189.64,
    "text": "रंग जाऊँ जो मैं हाथ लगाऊँ"
  },
  {
    "time": 193.74,
    "text": "दिन बीते सारा तेरी फ़िक्र में"
  },
  {
    "time": 198.41,
    "text": "रैन सारी तेरी ख़ैर मनाऊँ"
  },
  {
    "time": 212.95,
    "text": "केसरिया तेरा इश्क़ है, पिया, इश्क़ है, पिया"
  },
  {
    "time": 218.18,
    "text": "केसरिया तेरा इश्क़ है, पिया, इश्क़ है, पिया"
  },
  {
    "time": 223.03,
    "text": "पिया, इश्क़ है, पिया, इश्क़ है, पिया"
  },
  {
    "time": 231.26,
    "text": "केसरिया तेरा (इश्क़ है, पिया, इश्क़ है, पिया, इश्क़ है, पिया)"
  },
  {
    "time": 238.55,
    "text": "इश्क़ है, पिया (इश्क़ है, पिया, इश्क़ है, पिया, इश्क़ है, पिया)"
  },
  {
    "time": 244.39,
    "text": "रंग जाऊँ जो मैं (इश्क़ है, पिया, इश्क़ है, पिया, इश्क़ है, पिया)"
  },
  {
    "time": 249.12,
    "text": "हाथ लगाऊँ (इश्क़ है, पिया, इश्क़ है, पिया, इश्क़ है, पिया)"
  },
  {
    "time": 252.86,
    "text": "(इश्क़ है, पिया, इश्क़ है, पिया, इश्क़ है, पिया)"
  },
  {
    "time": 257.97,
    "text": "(इश्क़ है, पिया, इश्क़ है, पिया, इश्क़ है, पिया)"
  }
]
  },
  {
    id: 'track-7',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh',
    album: 'Aashiqui 2 Master Recording',
    duration: 262,
    audioUrl: 'https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4',
    youtubeId: 'Umqb9KENgmk',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#4f46e5',
    secondaryColor: '#6366f1',
    genre: 'Bollywood Romantic',
    year: 2026,
    plays: 6200000,
    lyrics: [
  {
    "time": 11.2,
    "text": "Hum tere bin ab reh nahi sakte"
  },
  {
    "time": 15.55,
    "text": "Tere bina kya wajood mera"
  },
  {
    "time": 25.75,
    "text": "Hum tere bin ab reh nahi sakte"
  },
  {
    "time": 30.45,
    "text": "Tere bina kya wajood mera"
  },
  {
    "time": 35.65,
    "text": "Tujh se juda agar ho jaayenge"
  },
  {
    "time": 40.28,
    "text": "Toh khud se hi ho jaayenge juda"
  },
  {
    "time": 48.22,
    "text": "Kyun ki tum hi ho"
  },
  {
    "time": 50.62,
    "text": "Ab tum hi ho"
  },
  {
    "time": 53.33,
    "text": "Zindagi ab tum hi ho"
  },
  {
    "time": 58.48,
    "text": "Chain bhi"
  },
  {
    "time": 60.63,
    "text": "Mera dard bhi"
  },
  {
    "time": 63.1,
    "text": "Meri aashiqui ab tum hi ho"
  },
  {
    "time": 88.72,
    "text": "Tera mera rishta hai kaisa"
  },
  {
    "time": 93.43,
    "text": "Ek pal door gawara nahi"
  },
  {
    "time": 98.68,
    "text": "Tere liye har roz hain jeete;"
  },
  {
    "time": 103.77,
    "text": "Tujhko diya mera waqt sabhi"
  },
  {
    "time": 108.45,
    "text": "Koi lamha mera na ho tere bina"
  },
  {
    "time": 113.19,
    "text": "Har saans pe naam tera"
  },
  {
    "time": 120.83,
    "text": "Kyun ki tum hi ho"
  },
  {
    "time": 123.97,
    "text": "Ab tum hi ho"
  },
  {
    "time": 126.46,
    "text": "Zindagi ab tum hi ho"
  },
  {
    "time": 131.65,
    "text": "Chain bhi"
  },
  {
    "time": 133.84,
    "text": "Mera dard bhi"
  },
  {
    "time": 136.15,
    "text": "Meri aashiqui ab tum hi ho"
  },
  {
    "time": 160.75,
    "text": "Tum hi ho"
  },
  {
    "time": 171.1,
    "text": "Tum hi ho"
  },
  {
    "time": 172.06,
    "text": "Tere liye hi jiya main"
  },
  {
    "time": 176.57,
    "text": "Khudko jo yun de diya hai"
  },
  {
    "time": 181.01,
    "text": "Tere wafa ne mujhko sambhala;"
  },
  {
    "time": 186.58,
    "text": "Saare ghamon ko dil se nikala"
  },
  {
    "time": 191.35,
    "text": "Tere saath mera hai naseeb juda"
  },
  {
    "time": 196.91,
    "text": "Tujhe paake addhura na raha"
  },
  {
    "time": 201.93,
    "text": "Mmm"
  },
  {
    "time": 204.21,
    "text": "Kyun ki tum hi ho"
  },
  {
    "time": 207.27,
    "text": "Ab tum hi ho"
  },
  {
    "time": 209.79,
    "text": "Zindagi ab tum hi ho"
  },
  {
    "time": 214.79,
    "text": "Chain bhi"
  },
  {
    "time": 217.29,
    "text": "Mera dard bhi"
  },
  {
    "time": 219.82,
    "text": "Meri aashiqui ab tum hi ho"
  },
  {
    "time": 224.73,
    "text": "Kyun ki tum hi ho"
  },
  {
    "time": 226.98,
    "text": "Ab tum hi ho"
  },
  {
    "time": 228.75,
    "text": "Zindagi ab tum hi ho"
  },
  {
    "time": 235.94,
    "text": "Chain bhi"
  },
  {
    "time": 237.6,
    "text": "Mera dard bhi"
  },
  {
    "time": 239.69,
    "text": "Meri aashiqui ab tum hi ho"
  }
]
  },
  {
    id: 'track-8',
    title: 'Channa Mereya',
    artist: 'Arijit Singh & Pritam',
    album: 'Ae Dil Hai Mushkil',
    duration: 289,
    audioUrl: 'https://aac.saavncdn.com/597/6da0627cfcc4b937160f664841e4572d_320.mp4',
    youtubeId: 'bzSTpdcs-EI',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#d97706',
    secondaryColor: '#b45309',
    genre: 'Bollywood Sufi / Soul',
    year: 2026,
    plays: 4900000,
    lyrics: [
  {
    "time": 1.02,
    "text": "अच्छा चलता हूँ"
  },
  {
    "time": 2.88,
    "text": "दुआओं में याद रखना"
  },
  {
    "time": 5.85,
    "text": "मेरे ज़िकर का ज़ुबां पे स्वाद रखना"
  },
  {
    "time": 32.82,
    "text": "दिल के संदूकों में"
  },
  {
    "time": 35.21,
    "text": "मेरे अच्छे काम रखना"
  },
  {
    "time": 37.43,
    "text": "चिट्टी तारों में भी"
  },
  {
    "time": 40.6,
    "text": "मेरा तू सलाम रखना"
  },
  {
    "time": 45.37,
    "text": "अँधेरा तेरा मैंने ले लिया"
  },
  {
    "time": 47.25,
    "text": "मेरा उजला सितारा तेरे नाम किया"
  },
  {
    "time": 54.35,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 56.72,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 59.95,
    "text": "चन्ना मेरेया मेरेया बेलिया"
  },
  {
    "time": 63.01,
    "text": "ओ पिया"
  },
  {
    "time": 65.09,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 67.66,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 69.98,
    "text": "चन्ना मेरेया मेरेया बेलिया"
  },
  {
    "time": 73.54,
    "text": "ओ पिया"
  },
  {
    "time": 129.59,
    "text": "महफ़िल में तेरी"
  },
  {
    "time": 132.73,
    "text": "हम न रहें जो"
  },
  {
    "time": 135.06,
    "text": "ग़म तो नहीं है"
  },
  {
    "time": 137.46,
    "text": "ग़म तो नहीं है"
  },
  {
    "time": 140.11,
    "text": "क़िस्से हमारे नज़दीकियों के"
  },
  {
    "time": 145.45,
    "text": "कम तो नहीं हैं"
  },
  {
    "time": 147.86,
    "text": "कम तो नहीं हैं"
  },
  {
    "time": 150.93,
    "text": "कितनी दफ़ा सुबहा को मेरी"
  },
  {
    "time": 155.59,
    "text": "तेरे आँगन में बैठे मैंने शाम किया"
  },
  {
    "time": 160.65,
    "text": "ओ पीया"
  },
  {
    "time": 162.09,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 163.72,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 166.14,
    "text": "चन्ना मेरेया मेरेया बेलिया"
  },
  {
    "time": 169.99,
    "text": "ओ पीया"
  },
  {
    "time": 171.55,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 174.13,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 176.63,
    "text": "चन्ना मेरेया मेरेया बेलिया"
  },
  {
    "time": 180.49,
    "text": "ओ पीया"
  },
  {
    "time": 193.86,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 195.66,
    "text": "चन्ना मेरेया मेरेया"
  },
  {
    "time": 198.37,
    "text": "चन्ना मेरेया मेरेया बेलिया"
  },
  {
    "time": 202.43,
    "text": "ओ पीया"
  }
]
  },
  {
    id: 'track-9',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh & Sachin-Jigar',
    album: 'Bhediya Master Suite',
    duration: 261,
    audioUrl: 'https://aac.saavncdn.com/340/c967df84d44726a98e4eb4c3d76eb243_320.mp4',
    youtubeId: 'ElZfdU54Cp8',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#059669',
    secondaryColor: '#10b981',
    genre: 'Bollywood Melodic',
    year: 2026,
    plays: 4450000,
    lyrics: [
  {
    "time": 21.98,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 27.25,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 32.25,
    "text": "किया रे जो भी तूने, कैसे किया रे?"
  },
  {
    "time": 37.39,
    "text": "जिया को मेरे बाँध ऐसे लिया रे"
  },
  {
    "time": 42.44,
    "text": "समझ के भी ना समझ मैं सकूँ"
  },
  {
    "time": 47.41,
    "text": "सवेरों का मेरे तू सूरज लागे"
  },
  {
    "time": 52.79,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 57.75,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 62.82,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 69.92,
    "text": "अपना बना ले, पिया, अपना बना ले, पिया"
  },
  {
    "time": 74.94,
    "text": "अपना बना ले मुझे, अपना बना ले, पिया"
  },
  {
    "time": 80.18,
    "text": "अपना बना ले, पिया, अपना बना ले, पिया"
  },
  {
    "time": 85.24,
    "text": "दिल के नगर में शहर तू बसा ले, पिया"
  },
  {
    "time": 113.48,
    "text": "छूने से तेरे, हाँ, तेरे, हाँ, तेरे"
  },
  {
    "time": 118.44,
    "text": "फीकी रुतों को रंग लगे"
  },
  {
    "time": 126.64,
    "text": "Mmm, छूने से तेरे, हाँ, तेरे, हाँ, तेरे"
  },
  {
    "time": 133.89,
    "text": "फीकी रुतों को रंग लगे"
  },
  {
    "time": 139.09,
    "text": "तेरी दिशा में क्यूँ चलने से मेरे"
  },
  {
    "time": 144.15,
    "text": "पैरों को पंख लगे?"
  },
  {
    "time": 147.04,
    "text": "रहा ना मेरे काम का जग सारा"
  },
  {
    "time": 152.01,
    "text": "हो बस तेरे नाम से ही गुज़ारा"
  },
  {
    "time": 157.33,
    "text": "उलझ के यूँ ना सुलझ मैं सकूँ"
  },
  {
    "time": 164.96,
    "text": "ज़ुबानियाँ तेरी झूठी भी सच लागे"
  },
  {
    "time": 170.05,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 175.05,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 180.3,
    "text": "तू मेरा कोई ना होके भी कुछ लागे"
  },
  {
    "time": 187.36,
    "text": "अपना बना ले, पिया, अपना बना ले, पिया"
  },
  {
    "time": 192.3,
    "text": "अपना बना ले मुझे, अपना बना ले, पिया"
  },
  {
    "time": 197.49,
    "text": "अपना बना ले, पिया, अपना बना ले, पिया"
  },
  {
    "time": 202.56,
    "text": "दिल के नगर में शहर तू बसा ले, पिया"
  },
  {
    "time": 207.68,
    "text": "ओ, सब कुछ मेरा चाहे नाम अपने लिखा ले"
  },
  {
    "time": 219.17,
    "text": "बदले में इतनी तो यारी निभा ले"
  },
  {
    "time": 229.52,
    "text": "जग की हिरासत से मुझको छुड़ा ले"
  },
  {
    "time": 238.22,
    "text": "अपना बना ले, बस अपना बना ले"
  },
  {
    "time": 247.87,
    "text": "अपना बना ले"
  },
  {
    "time": 252.96,
    "text": "अपना बना ले"
  }
]
  },
  {
    id: 'track-12',
    title: 'Raataan Lambiyan',
    artist: 'Jubin Nautiyal & Asees Kaur',
    album: 'Shershaah Master Recording',
    duration: 230,
    audioUrl: 'https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4',
    youtubeId: 'gvyUuxdRdR4',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#0284c7',
    secondaryColor: '#38bdf8',
    genre: 'Bollywood Acoustic',
    year: 2026,
    plays: 4120000,
    lyrics: [
  {
    "time": 23.2,
    "text": "ਤੇਰੀ-ਮੇਰੀ ਗੱਲਾਂ ਹੋ ਗਈ ਮਸ਼ਹੂਰ"
  },
  {
    "time": 25.99,
    "text": "कर ना कभी तू मुझे नज़रों से दूर"
  },
  {
    "time": 29.15,
    "text": "ਕਿੱਥੇ ਚੱਲੀਏ? ਤੂੰ ਕਿੱਥੇ ਚੱਲੀਏ?"
  },
  {
    "time": 31.98,
    "text": "ਤੂੰ ਕਿੱਥੇ ਚੱਲੀਏ? (ਕਿੱਥੇ ਚੱਲੀਏ?)"
  },
  {
    "time": 35.3,
    "text": "ਜਾਣਦਾ ਐ ਦਿਲ, ਯੇ ਤੋ ਜਾਣਦੀ ਐ ਤੂੰ"
  },
  {
    "time": 38.25,
    "text": "तेरे बिना मैं ना रहूँ, मेरे बिना तू"
  },
  {
    "time": 41.24,
    "text": "ਕਿੱਥੇ ਚੱਲੀਏ? ਤੂੰ ਕਿੱਥੇ ਚੱਲੀਏ?"
  },
  {
    "time": 43.84,
    "text": "ਤੂੰ ਕਿੱਥੇ ਚੱਲੀਏ? (ਚੱਲ ਚੱਲੀਏ)"
  },
  {
    "time": 47.34,
    "text": "ਕਾਟੂੰ ਕੈਸੇ ਰਾਤਾਂ, ਓ, ਸਾਂਵਰੇ?"
  },
  {
    "time": 53.44,
    "text": "जिया नहीं जाता, सुन बावरे"
  },
  {
    "time": 58.18,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 61.14,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  },
  {
    "time": 63.71,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 66.57,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  },
  {
    "time": 82.22,
    "text": "ਚਮ-ਚਮ-ਚਮ ਅੰਬਰਾਂ ਦੇ ਤਾਰੇ ਕਹਿੰਦੇ ਨੇ, ਸੱਜਣਾ"
  },
  {
    "time": 88.52,
    "text": "ਤੂੰ ਹੀ ਚੰਨ ਮੇਰੇ ਇਸ ਦਿਲ ਦਾ, ਮੰਨ ਲੈ ਵੇ, ਸੱਜਣਾ"
  },
  {
    "time": 95.34,
    "text": "ਤੇਰੇ ਬਿਨਾਂ ਮੇਰਾ ਹੋਵੇ ਨਾ ਗੁਜ਼ਾਰਾ"
  },
  {
    "time": 100.96,
    "text": "ਛੱਡ ਕੇ ਨਾ ਜਾਵੀਂ ਮੈਨੂੰ, ਤੂੰ ਹੀ ਹੈ ਸਹਾਰਾ"
  },
  {
    "time": 106.57,
    "text": "ਕਾਟੂੰ ਕੈਸੇ ਰਾਤਾਂ, ਓ, ਸਾਂਵਰੇ?"
  },
  {
    "time": 112.49,
    "text": "जिया नहीं जाता, सुन बावरे"
  },
  {
    "time": 117.38,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 120.42,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  },
  {
    "time": 123.12,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 126.08,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  },
  {
    "time": 141.99,
    "text": "ਤੇਰੀ-ਮੇਰੀ ਗੱਲਾਂ ਹੋ ਗਈ ਮਸ਼ਹੂਰ"
  },
  {
    "time": 144.61,
    "text": "ਕਰ ਨਾ ਕਭੀ ਤੂੰ ਮੈਨੂੰ ਨਜ਼ਰੋਂ ਸੇ ਦੂਰ"
  },
  {
    "time": 147.7,
    "text": "ਪਿੱਛੇ ਚੱਲੀਏ, ਤੇਰੇ ਪਿੱਛੇ ਚੱਲੀਏ, ਤੇਰੇ ਪਿੱਛੇ ਚੱਲੀਏ"
  },
  {
    "time": 153.66,
    "text": "ਜਾਣਦਾ ਐ ਦਿਲ, ਯੇ ਤੋ ਜਾਣਦੀ ਐ ਤੂੰ"
  },
  {
    "time": 157.03,
    "text": "तेरे बिना मैं ना रहूँ, मेरे बिना तू"
  },
  {
    "time": 159.87,
    "text": "ਕਿੱਥੇ ਚੱਲੀਏ? ਤੂੰ ਕਿੱਥੇ ਚੱਲੀਏ?"
  },
  {
    "time": 161.72,
    "text": "ਤੂੰ ਕਿੱਥੇ ਚੱਲੀਏ? (ਕਿੱਥੇ ਚੱਲੀਏ?)"
  },
  {
    "time": 165.55,
    "text": "ਕਾਟੂੰ ਕੈਸੇ ਰਾਤਾਂ, ਓ, ਸਾਂਵਰੇ?"
  },
  {
    "time": 172.15,
    "text": "जिया नहीं जाता, सुन बावरे"
  },
  {
    "time": 176.78,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 179.67,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  },
  {
    "time": 182.16,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 185.37,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  },
  {
    "time": 212.06,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 215.12,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  },
  {
    "time": 217.61,
    "text": "ਕਿ ਰਾਤਾਂ ਲੰਬੀਆਂ-ਲੰਬੀਆਂ ਰੇ"
  },
  {
    "time": 220.85,
    "text": "ਕਟੇਂ ਤੇਰੇ ਸੰਗ ਆਂ, ਸੰਗ ਆਂ ਰੇ"
  }
]
  },
  {
    id: 'track-13',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra',
    album: 'Animal Master Suite',
    duration: 250,
    audioUrl: 'https://aac.saavncdn.com/092/81b52beea90f186f27cf5c5eead972c8_320.mp4',
    youtubeId: '87JIOAX3njM',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#dc2626',
    secondaryColor: '#b91c1c',
    genre: 'Bollywood Melodic',
    year: 2026,
    plays: 3890000,
    lyrics: [
  {
    "time": 25.45,
    "text": "पहले भी मैं तुम से मिला हूँ"
  },
  {
    "time": 31.65,
    "text": "पहली दफ़ा ही मिल के लगा"
  },
  {
    "time": 37.73,
    "text": "तूने छुआ ज़ख़्मों को मेरे"
  },
  {
    "time": 44.18,
    "text": "मरहम-मरहम दिल पे लगा"
  },
  {
    "time": 51.04,
    "text": "पागल-पागल हैं थोड़े"
  },
  {
    "time": 54.29,
    "text": "बादल-बादल हैं दोनों"
  },
  {
    "time": 57.12,
    "text": "खुल के बरसें, भीगें, आ ज़रा"
  },
  {
    "time": 62.54,
    "text": "पहले भी मैं तुम से मिला हूँ"
  },
  {
    "time": 69.08,
    "text": "पहली दफ़ा ही मिल के लगा"
  },
  {
    "time": 75.15,
    "text": "तूने छुआ ज़ख़्मों को मेरे"
  },
  {
    "time": 81.43,
    "text": "मरहम-मरहम दिल पे लगा"
  },
  {
    "time": 113.13,
    "text": "ग़लत क्या, सही क्या, मुझे ना पता है"
  },
  {
    "time": 119.38,
    "text": "तुम्हें 'गर पता हो, बता देना"
  },
  {
    "time": 125.65,
    "text": "मैं अरसे से ख़ुद से ज़रा लापता हूँ"
  },
  {
    "time": 131.76,
    "text": "तुम्हें 'गर मिलूँ तो पता देना"
  },
  {
    "time": 137.67,
    "text": "खो ना जाना मुझे देखते-देखते"
  },
  {
    "time": 143.72,
    "text": "तू ही ज़रिया, तू ही मंज़िल है"
  },
  {
    "time": 150.01,
    "text": "या कि दिल है इतना बता?"
  },
  {
    "time": 156.11,
    "text": "तूने छुआ ज़ख़्मों को मेरे"
  },
  {
    "time": 162.54,
    "text": "मरहम-मरहम दिल पे लगा"
  },
  {
    "time": 169.56,
    "text": "पागल-पागल हैं थोड़े"
  },
  {
    "time": 172.72,
    "text": "बादल-बादल हैं भीगे"
  },
  {
    "time": 175.62,
    "text": "बरसें-बरसें, भीगें, आ ज़रा"
  },
  {
    "time": 180.93,
    "text": "पहले भी मैं तुम से मिला हूँ"
  },
  {
    "time": 187.41,
    "text": "पहली दफ़ा ही मिल के लगा"
  },
  {
    "time": 193.67,
    "text": "तूने छुआ ज़ख़्मों को मेरे"
  },
  {
    "time": 199.72,
    "text": "मरहम-मरहम दिल पे लगा"
  }
]
  },
  {
    id: 'track-14',
    title: 'Shayad',
    artist: 'Arijit Singh & Pritam',
    album: 'Love Aaj Kal Studio Master',
    duration: 247,
    audioUrl: 'https://aac.saavncdn.com/862/e277c1b441b562640c6b264aa3335a83_320.mp4',
    youtubeId: 'ILzK2V8X348',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#d97706',
    secondaryColor: '#ea580c',
    genre: 'Bollywood Romance',
    year: 2026,
    plays: 3670000,
    lyrics: [
  {
    "time": 14.31,
    "text": "शायद कभी ना कह सकूँ मैं तुमको"
  },
  {
    "time": 21.78,
    "text": "कहे बिना समझ लो तुम शायद"
  },
  {
    "time": 28.53,
    "text": "शायद मेरे ख़याल में तुम एक दिन"
  },
  {
    "time": 35.83,
    "text": "मिलो मुझे कहीं पे गुम शायद"
  },
  {
    "time": 42.04,
    "text": "जो तुम ना हो, रहेंगे हम नहीं"
  },
  {
    "time": 49.08,
    "text": "जो तुम ना हो, रहेंगे हम नहीं"
  },
  {
    "time": 56.36,
    "text": "ना चाहिए कुछ तुमसे ज़्यादा, तुमसे कम नहीं"
  },
  {
    "time": 63.19,
    "text": "जो तुम ना हो तो हम भी हम नहीं"
  },
  {
    "time": 70.14,
    "text": "जो तुम ना हो तो हम भी हम नहीं"
  },
  {
    "time": 77.5,
    "text": "ना चाहिए कुछ तुमसे ज़्यादा, तुमसे कम नहीं"
  },
  {
    "time": 114.37,
    "text": "आँखों को ख़्वाब देना"
  },
  {
    "time": 117.89,
    "text": "ख़ुद ही सवाल करके ख़ुद ही जवाब देना तेरी तरफ़ से"
  },
  {
    "time": 128.48,
    "text": "बिन काम काम करना"
  },
  {
    "time": 131.91,
    "text": "जाना कहीं हो चाहे, हर बार ही गुज़रना तेरी तरफ़ से"
  },
  {
    "time": 142.53,
    "text": "ये कोशिशें तो होंगी कम नहीं"
  },
  {
    "time": 149.67,
    "text": "ये कोशिशें तो होंगी कम नहीं"
  },
  {
    "time": 156.97,
    "text": "ना चाहिए कुछ तुमसे ज़्यादा, तुमसे कम नहीं"
  },
  {
    "time": 163.76,
    "text": "जो तुम ना हो, रहेंगे हम नहीं"
  },
  {
    "time": 170.81,
    "text": "जो तुम ना हो तो हम भी हम नहीं"
  },
  {
    "time": 178.15,
    "text": "ना चाहिए कुछ तुमसे ज़्यादा, तुमसे कम नहीं"
  },
  {
    "time": 184.92,
    "text": "जो तुम ना हो"
  },
  {
    "time": 192.08,
    "text": "जो तुम ना हो"
  },
  {
    "time": 199.11,
    "text": "जो तुम ना हो"
  }
]
  },
  {
    id: 'track-15',
    title: 'Agar Tum Saath Ho',
    artist: 'Alka Yagnik & Arijit Singh',
    album: 'Tamasha Master Suite',
    duration: 341,
    audioUrl: 'https://aac.saavncdn.com/994/2e6b47719cea3e7c9f971a3f1ddc9b0a_320.mp4',
    youtubeId: 'sK7riqg2mr4',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#7c3aed',
    secondaryColor: '#9333ea',
    genre: 'Bollywood Soul',
    year: 2026,
    plays: 5100000,
    lyrics: [
  {
    "time": 24.9,
    "text": "पल भर ठहर जाओ"
  },
  {
    "time": 28.45,
    "text": "दिल ये संभल जाए"
  },
  {
    "time": 32.45,
    "text": "कैसे तुम्हें रोका करूँ"
  },
  {
    "time": 40.19,
    "text": "मेरी तरफ आता हर ग़म फिसल जाए"
  },
  {
    "time": 47.74,
    "text": "आँखों में तुम को भरूं"
  },
  {
    "time": 55.97,
    "text": "बिन बोले बातें तुमसे करूँ"
  },
  {
    "time": 63.34,
    "text": "गर तुम साथ हो"
  },
  {
    "time": 70.82,
    "text": "अगर तुम साथ हो"
  },
  {
    "time": 90.98,
    "text": "बहती रहती"
  },
  {
    "time": 99.47,
    "text": "नहर नादिया सी तेरी दुनिया में"
  },
  {
    "time": 107.33,
    "text": "मेरी दुनिया है तेरी चाहतों में"
  },
  {
    "time": 115.25,
    "text": "मैं ढल जाती हूँ तेरी आदतों में"
  },
  {
    "time": 121.81,
    "text": "गर तुम साथ हो"
  },
  {
    "time": 126.11,
    "text": "तेरी नज़रों में है तेरे सपने"
  },
  {
    "time": 129.48,
    "text": "तेरे सपनों में है नाराज़ी"
  },
  {
    "time": 134.04,
    "text": "मुझे लगता है के बातें दिल की"
  },
  {
    "time": 137.41,
    "text": "होती लफ़्ज़ों की धोखेबाज़ी"
  },
  {
    "time": 141.65,
    "text": "तुम साथ हो या ना हो क्या फर्क है"
  },
  {
    "time": 149.51,
    "text": "बेदर्द थी ज़िन्दगी बेदर्द है"
  },
  {
    "time": 156.75,
    "text": "गर तुम साथ हो"
  },
  {
    "time": 162.74,
    "text": "अगर तुम साथ हो"
  },
  {
    "time": 202.74,
    "text": "पलकें झपकते दी दिन ये निकल जाए"
  },
  {
    "time": 210.54,
    "text": "बैठी बैठी भागी फिरूँ"
  },
  {
    "time": 217.78,
    "text": "मेरी तरफ आता हर ग़म फिसल जाए"
  },
  {
    "time": 226.14,
    "text": "आँखों एमीन तुम को भरूं"
  },
  {
    "time": 238.68,
    "text": "बिन बोले बातें तुमसे करूँ"
  },
  {
    "time": 240.87,
    "text": "गर तुम साथ हो"
  },
  {
    "time": 248.42,
    "text": "अगर तुम साथ हो"
  },
  {
    "time": 253.03,
    "text": "तेरी नज़रों में है तेरे सपने"
  },
  {
    "time": 256.28,
    "text": "तेरे सपनों में है नाराज़ी"
  },
  {
    "time": 260.71,
    "text": "मुझे लगता है के बातें दिल की"
  },
  {
    "time": 264.02,
    "text": "होती लफ़्ज़ों की धोखेबाज़ी"
  },
  {
    "time": 268.45,
    "text": "तुम साथ हो या ना हो क्या फर्क है"
  },
  {
    "time": 276.31,
    "text": "बेदर्द थी ज़िन्दगी बेदर्द है"
  },
  {
    "time": 284.36,
    "text": "अगर तुम साथ हो"
  },
  {
    "time": 288.17,
    "text": "दिल ये संभल जाए"
  },
  {
    "time": 291.41,
    "text": "(अगर तुम साथ हो)"
  },
  {
    "time": 295.9,
    "text": "हर ग़म फिसल जाए"
  },
  {
    "time": 299.21,
    "text": "(अगर तुम साथ हो)"
  },
  {
    "time": 303.64,
    "text": "दिल ये निकल जाए"
  },
  {
    "time": 307.01,
    "text": "(अगर तुम साथ हो)"
  },
  {
    "time": 313.75,
    "text": "हर ग़म फिसल जाए"
  }
]
  },
  {
    id: 'track-10',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    album: 'MoonChild Era',
    duration: 198,
    audioUrl: 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4',
    youtubeId: 'mH_LFkWxpI0',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#e11d48',
    secondaryColor: '#f43f5e',
    genre: 'Punjabi Pop',
    year: 2026,
    plays: 3890000,
    lyrics: [
  {
    "time": 15.73,
    "text": "Kol Ae Tu Yeah"
  },
  {
    "time": 17.39,
    "text": "Sambh Le Dil Mere Nu Yeah"
  },
  {
    "time": 19.35,
    "text": "Dass De Doori Ae Kyun Yeah"
  },
  {
    "time": 21.35,
    "text": "Meriyan Ankhan De Samne Reh"
  },
  {
    "time": 23.89,
    "text": "Tere Bagair Yeah"
  },
  {
    "time": 25.4,
    "text": "Lagdi Duniya Zehar Yeah"
  },
  {
    "time": 27.4,
    "text": "Jivein Laiju Koyi Gair Yeah"
  },
  {
    "time": 29.36,
    "text": "Paige Kaiyan Naal Vair Yeah"
  },
  {
    "time": 31.93,
    "text": "Ankh Laawan Mach Jaawein"
  },
  {
    "time": 33.93,
    "text": "Poori Ae Tu Fire"
  },
  {
    "time": 35.75,
    "text": "Ni Tu Meri Ho Jaawein"
  },
  {
    "time": 37.74,
    "text": "Ae Hi Hai Desire"
  },
  {
    "time": 39.82,
    "text": "Ankh Laawa Mach Jaawein"
  },
  {
    "time": 41.78,
    "text": "Poori Ae Tu Fire"
  },
  {
    "time": 43.7,
    "text": "Ni Tu Meri Ho Jaawein"
  },
  {
    "time": 46.78,
    "text": "Baby Baby"
  },
  {
    "time": 48.01,
    "text": "Tera Ni Main Tera Ni Main Lover"
  },
  {
    "time": 50.84,
    "text": "Ankhan Da Dangeya"
  },
  {
    "time": 51.88,
    "text": "Hona Ni Main Hona Ni Main Recover"
  },
  {
    "time": 54.72,
    "text": "Tainu Jo Takkeya"
  },
  {
    "time": 55.92,
    "text": "Reha Ni Main Reha Ni Main Sober"
  },
  {
    "time": 58.77,
    "text": "Tera Mere Dil Te Ae"
  },
  {
    "time": 60.7,
    "text": "Rooh Te Ae Asar"
  },
  {
    "time": 79.82,
    "text": "Tere Kole Howan Jadon"
  },
  {
    "time": 81.75,
    "text": "Chup Vi Chup Na Rehndi Ae"
  },
  {
    "time": 83.75,
    "text": "Taare Tuttde Ne Jadon"
  },
  {
    "time": 85.67,
    "text": "Zulf Laate Khaindi Aa"
  },
  {
    "time": 87.59,
    "text": "Turrdi Aa Kithe Kudi"
  },
  {
    "time": 89.85,
    "text": "Pani Wangu Behndi Ae"
  },
  {
    "time": 91.83,
    "text": "Baahan Ch Na Howe"
  },
  {
    "time": 93.21,
    "text": "Tu Taan Jaan Ch Jaan Naal"
  },
  {
    "time": 94.74,
    "text": "Paindi Ae"
  },
  {
    "time": 95.79,
    "text": "Turri Jivein Koyi Nasha"
  },
  {
    "time": 97.84,
    "text": "Peena Aa Main Day Night"
  },
  {
    "time": 99.84,
    "text": "Thoda Jeha Trippy Aan"
  },
  {
    "time": 101.7,
    "text": "Par Tu Hai Taan It’s Alright"
  },
  {
    "time": 103.04,
    "text": "Baby Baby"
  },
  {
    "time": 103.65,
    "text": "Tera Ni Main Tera Ni Main Lover"
  },
  {
    "time": 106.74,
    "text": "Ankhan Da Dangeya"
  },
  {
    "time": 107.82,
    "text": "Hona Ni Main Hona Ni Main Recover"
  },
  {
    "time": 110.69,
    "text": "Tainu Jo Takkeya"
  },
  {
    "time": 111.79,
    "text": "Reha Ni Main Reha Ni Main Sober"
  },
  {
    "time": 114.96,
    "text": "Tera Mere Dil Te Ae"
  },
  {
    "time": 116.86,
    "text": "Rooh Te Ae Asar"
  },
  {
    "time": 118.74,
    "text": "Baby Baby"
  },
  {
    "time": 119.74,
    "text": "Chaliye Kitte Door Kitte Ni"
  },
  {
    "time": 121.87,
    "text": "2 Seater Vich Tu Te Main"
  },
  {
    "time": 123.55,
    "text": "Paisa Paani Wang Laa Doon"
  },
  {
    "time": 125.96,
    "text": "Ki Saa Chaidi Naam Te Le"
  },
  {
    "time": 127.79,
    "text": "Duniya Main Kardun Teri"
  },
  {
    "time": 129.78,
    "text": "Bas Tu Meri Hoke Reh"
  },
  {
    "time": 131.78,
    "text": "Saari Raat Na Sowan Sachi"
  },
  {
    "time": 133.73,
    "text": "Kudiye Mere Kol Ta Beh"
  },
  {
    "time": 135.7,
    "text": "Rakhdi Ae Raj De Tu"
  },
  {
    "time": 137.97,
    "text": "Modde Utte Sar Ni"
  },
  {
    "time": 139.67,
    "text": "Bullan Ton Na Jaawe Smile"
  },
  {
    "time": 141.63,
    "text": "Kini Kini Chirr Ni"
  },
  {
    "time": 143.71,
    "text": "Rakhdi Ae Raj De Tu"
  },
  {
    "time": 145.71,
    "text": "Modde Utte Sar Ni"
  },
  {
    "time": 147.92,
    "text": "Bullan Ton Na Jaawe Smile"
  },
  {
    "time": 149.91,
    "text": "Kini Kini Chirr Ni"
  },
  {
    "time": 151.63,
    "text": "Tera Ni Main Tera Ni Main Lover"
  },
  {
    "time": 154.88,
    "text": "Ankhan Da Dangeya"
  },
  {
    "time": 155.72,
    "text": "Hona Ni Main Hona Ni Main Recover"
  },
  {
    "time": 158.76,
    "text": "Tainu Jo Takkeya"
  },
  {
    "time": 159.88,
    "text": "Reha Ni Main Reha Ni Main Sober"
  },
  {
    "time": 162.6,
    "text": "Tera Mere Dil Te Ae"
  },
  {
    "time": 164.92,
    "text": "Rooh Te Ae Asar"
  },
  {
    "time": 166.84,
    "text": "Baby Baby"
  },
  {
    "time": 167.56,
    "text": "Tera Ni Main Tera Ni Main Lover"
  },
  {
    "time": 170.57,
    "text": "Baby Baby"
  },
  {
    "time": 171.65,
    "text": "Tera Ni Main Tera Ni Main Lover"
  },
  {
    "time": 174.79,
    "text": "Baby Baby"
  },
  {
    "time": 175.53,
    "text": "Tera Ni Main Tera Ni Main Lover"
  },
  {
    "time": 178.57,
    "text": "Baby Baby"
  },
  {
    "time": 179.73,
    "text": "Tera Ni Main Tera Ni Main Lover"
  }
]
  },
  {
    id: 'track-11',
    title: 'Softly',
    artist: 'Karan Aujla',
    album: 'Making Memories',
    duration: 154,
    audioUrl: 'https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4',
    youtubeId: 'cWMxCE2HTag',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    genre: 'Punjabi High Energy',
    year: 2026,
    plays: 3150000,
    lyrics: [
  {
    "time": 5.38,
    "text": "Gal sun lallaria ve"
  },
  {
    "time": 7.95,
    "text": "Ah lok mere te hasde"
  },
  {
    "time": 10.47,
    "text": "Paise jyada dedugi"
  },
  {
    "time": 12.76,
    "text": "Matching krdenga tan dsde"
  },
  {
    "time": 15.59,
    "text": "Sunla ve ditto same chahidi"
  },
  {
    "time": 18.06,
    "text": "Ah le photo ve Ferrari laal di"
  },
  {
    "time": 20.81,
    "text": "Chunni meri rangde lallaria"
  },
  {
    "time": 25.76,
    "text": "Ve chunni meri rangde lallaria"
  },
  {
    "time": 28.36,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 31.19,
    "text": "Chunni meri rangde lallaria ve"
  },
  {
    "time": 33.5,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 36.35,
    "text": "Oda pange lagde aa"
  },
  {
    "time": 37.73,
    "text": "Ohnu change lagde aa"
  },
  {
    "time": 39.01,
    "text": "Tahi socha kundla pvaalva"
  },
  {
    "time": 41.47,
    "text": "Socha shar-e-aam hoja"
  },
  {
    "time": 42.85,
    "text": "Sochdi aan naam ohda"
  },
  {
    "time": 44.18,
    "text": "Gutt utte tatto bnwalava"
  },
  {
    "time": 46.65,
    "text": "Sochdi fer taaldi main"
  },
  {
    "time": 48.01,
    "text": "Phantom de nal di main"
  },
  {
    "time": 49.32,
    "text": "Ik hor kurti svaalva"
  },
  {
    "time": 51.82,
    "text": "Ohnu dekh ke tan meri hojve"
  },
  {
    "time": 54.4,
    "text": "Umr vdhi de nal di"
  },
  {
    "time": 56.65,
    "text": "Ve chunni meri rangde lallaria"
  },
  {
    "time": 59.33,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 62.14,
    "text": "Chunni meri rangde lallaria ve"
  },
  {
    "time": 64.45,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 77.62,
    "text": "Mere laye dekhle je kudiyan kwaria ne dekhi ve duppate tere vikde"
  },
  {
    "time": 82.79,
    "text": "Eni sohni chunni lagge jatti te layi ke menu jdo oho dekhe gaana likhde"
  },
  {
    "time": 87.91,
    "text": "Kam menu bde"
  },
  {
    "time": 88.99,
    "text": "Saneaare kolo karhe"
  },
  {
    "time": 90.3,
    "text": "Nale hle main Sephora geda marna"
  },
  {
    "time": 93.13,
    "text": "Aunda ae pyar ohda"
  },
  {
    "time": 94.48,
    "text": "Hona ae deedar ohda"
  },
  {
    "time": 95.77,
    "text": "Chajh nal hoi main tyaar na"
  },
  {
    "time": 98.25,
    "text": "Dar lgda na kithe rehjva"
  },
  {
    "time": 100.85,
    "text": "Saddi na saddi de nal di"
  },
  {
    "time": 103.08,
    "text": "Ve chunni meri rangde lallaria"
  },
  {
    "time": 105.77,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 108.61,
    "text": "Chunni meri rangde lallaria ve"
  },
  {
    "time": 110.91,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 113.45,
    "text": "(Ve chunni meri rangde lallaria)"
  },
  {
    "time": 116.09,
    "text": "(Mere yaar di gaddi de naal di)"
  },
  {
    "time": 118.66,
    "text": "(Mere yaar di gaddi de naal di)"
  },
  {
    "time": 121.22,
    "text": "(Mere yaar di gaddi de naal di)"
  },
  {
    "time": 124.08,
    "text": "Aujle nu lor meri hojave"
  },
  {
    "time": 126.7,
    "text": "Ghar di kaddi de naal di"
  },
  {
    "time": 128.91,
    "text": "Ve chunni meri rangde lallaria"
  },
  {
    "time": 131.54,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 134.08,
    "text": "Ve chunni meri rangde lallaria"
  },
  {
    "time": 136.73,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 139.3,
    "text": "Ve chunni meri rangde lallaria"
  },
  {
    "time": 141.89,
    "text": "Mere yaar di gaddi de naal di"
  },
  {
    "time": 144.72,
    "text": "Chunni meri rangde lallaria ve"
  },
  {
    "time": 147.05,
    "text": "Mere yaar di gaddi de naal di"
  }
]
  },
  {
    id: 'track-18',
    title: 'Born to Shine',
    artist: 'Diljit Dosanjh',
    album: 'G.O.A.T.',
    duration: 213,
    audioUrl: 'https://aac.saavncdn.com/945/b509ce839059a03d7fa023630236b568_320.mp4',
    youtubeId: 'cl0a3i2wFcc',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#f59e0b',
    secondaryColor: '#d97706',
    genre: 'Punjabi Bhangra',
    year: 2026,
    plays: 4200000,
    lyrics: [
  {
    "time": 7.34,
    "text": "Desi Crew, Desi Crew"
  },
  {
    "time": 9.83,
    "text": "Desi Crew, Desi Crew"
  },
  {
    "time": 12.35,
    "text": "Ho, pakki saadi ikk aa pachhan, patlo"
  },
  {
    "time": 15.21,
    "text": "Circle chhota, gall-baat vaddi ae"
  },
  {
    "time": 18.08,
    "text": "Ikk pichhe lagdiyan satt zero'an"
  },
  {
    "time": 20.57,
    "text": "Aidde mull aali jatt kol gaddi ae"
  },
  {
    "time": 23.02,
    "text": "Dosanjhan aala naam dilaan utte likheya"
  },
  {
    "time": 25.94,
    "text": "Khaasa jor lag jau mitaun vaaste (yeah)"
  },
  {
    "time": 28.32,
    "text": "Ho, paise-poose baare, billo, soche duniya"
  },
  {
    "time": 31.11,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 33.89,
    "text": "Paise-poose baare, billo, soche duniya"
  },
  {
    "time": 36.51,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 52.23,
    "text": "Oh, khade pair time 'te nibed dinne aan"
  },
  {
    "time": 55.27,
    "text": "Rakkheya nahi hisaab kade baaki kise naa'"
  },
  {
    "time": 57.86,
    "text": "Hoke jazbaati bhaavein haar jaaidai"
  },
  {
    "time": 60.63,
    "text": "Jitte nahiyo karke chalaaki kise naa'"
  },
  {
    "time": 63.23,
    "text": "Hoke jazbaati bhaavein haar jaaidai"
  },
  {
    "time": 65.98,
    "text": "Jitte nahiyo karke chalaaki kise naa'"
  },
  {
    "time": 68.59,
    "text": "Russi vi mashook taan manaai jaandi ni"
  },
  {
    "time": 70.8,
    "text": "Saale firde aan jagg pichhe laun vaaste (yeah)"
  },
  {
    "time": 73.44,
    "text": "Ho, paise-poose baare, billo, soche duniya"
  },
  {
    "time": 76.67,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 79.27,
    "text": "Paise-poose baare, billo, soche duniya"
  },
  {
    "time": 81.99,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 87.12,
    "text": "Chakk ke pahuncha turan waaliye"
  },
  {
    "time": 90.28,
    "text": "Taki Taki sunan waaliye"
  },
  {
    "time": 92.79,
    "text": "Tedha-tedha takke kaas ton?"
  },
  {
    "time": 95.16,
    "text": "Ni purse 'ch pistol rakkhe kaas ton?"
  },
  {
    "time": 97.73,
    "text": "Ni purse 'ch pistol rakkhe kaas ton?"
  },
  {
    "time": 100.24,
    "text": "Oh, tere utte aaya saada dil, patlo"
  },
  {
    "time": 103.14,
    "text": "Chal dovein karde aan chill, patlo"
  },
  {
    "time": 105.57,
    "text": "Oh, vigde ve jatt vallon dhanwaad ni"
  },
  {
    "time": 108.26,
    "text": "Meri zindagi nu zindagi banaun vaaste (yeah)"
  },
  {
    "time": 110.1,
    "text": "Ho, paise-poose baare, billo, soche duniya"
  },
  {
    "time": 113.99,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 116.63,
    "text": "Paise-poose baare, billo, soche duniya"
  },
  {
    "time": 119.27,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 134.9,
    "text": "Ho, kirpa baabe di, kamm lot, jattiye"
  },
  {
    "time": 137.88,
    "text": "Aaye saalaan DJ'an 'te jatt gajjdai"
  },
  {
    "time": 140.49,
    "text": "Baakiyan de naalon saada farak bada"
  },
  {
    "time": 143.22,
    "text": "Bhar ke lafede waangu geet vajjdai"
  },
  {
    "time": 145.98,
    "text": "Difference baakiyan ton bada, jattiye"
  },
  {
    "time": 148.6,
    "text": "Bhar ke lafede waangu geet vajjdai"
  },
  {
    "time": 151.16,
    "text": "TV'an de naal taan nahi kamm challeya"
  },
  {
    "time": 153.54,
    "text": "Rakkhe bhaambad main duniya machaun vaaste (yeah)"
  },
  {
    "time": 156.35,
    "text": "Ho, paise-poose baare, billo, soche duniya"
  },
  {
    "time": 159.28,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 161.98,
    "text": "Paise-poose baare, billo, soche duniya"
  },
  {
    "time": 164.64,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 175.08,
    "text": "Tere jachda ae kaala-kaala suit, jattiye"
  },
  {
    "time": 177.57,
    "text": "Mere kehn utte kade-kade paa leya kar"
  },
  {
    "time": 180.49,
    "text": "Chakvein hunde aan bhaavein geet Maan de"
  },
  {
    "time": 183.33,
    "text": "Duniya ton chori-chori laa leya kar"
  },
  {
    "time": 185.83,
    "text": "Chakvein hunde aan bhaavein geet Maan de"
  },
  {
    "time": 188.68,
    "text": "Duniya ton chori-chori laa leya kar"
  },
  {
    "time": 190.87,
    "text": "Main tere sheher diyan kudiyan nu ghaint lagda"
  },
  {
    "time": 193.82,
    "text": "Kaahliyan ne jatt nu viauhan vaaste (yeah)"
  },
  {
    "time": 196.17,
    "text": "Ho, paise-poose baare, billo, soche duniya"
  },
  {
    "time": 199.22,
    "text": "Jatt paida hoya bas chhaun vaaste"
  },
  {
    "time": 201.77,
    "text": "Paise-poose baare, billo, soche duniya"
  },
  {
    "time": 204.4,
    "text": "Jatt paida hoya bas chhaun vaaste"
  }
]
  },
  {
    id: 'track-19',
    title: 'Winning Speech',
    artist: 'Karan Aujla',
    album: 'Street Dreams',
    duration: 195,
    audioUrl: 'https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4',
    youtubeId: 'qL0v4Uv6mE0',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#2563eb',
    secondaryColor: '#3b82f6',
    genre: 'Punjabi Flow',
    year: 2026,
    plays: 2850000,
    lyrics: [
  {
    "time": 8.11,
    "text": "Show MXRCI on it"
  },
  {
    "time": 11.77,
    "text": "Do-do ghode Magna ni, chaar G-Wagon'an ni"
  },
  {
    "time": 14.53,
    "text": "Utte nu main chhe-chhe inch chakkiyan"
  },
  {
    "time": 17.38,
    "text": "Time laggu mitne nu, saanu thalle sittne nu"
  },
  {
    "time": 20.21,
    "text": "21 vaari jor laa laye chhattiyan"
  },
  {
    "time": 22.94,
    "text": "Fan ikko naar da main, 10 vaari vaarda main"
  },
  {
    "time": 25.82,
    "text": "Ohde utton 100-100 diyan gatthiyan"
  },
  {
    "time": 28.51,
    "text": "Time laggu mitne nu, saanu thalle sittne nu"
  },
  {
    "time": 31.36,
    "text": "21 vaari jor laa laye chhatti..."
  },
  {
    "time": 33.26,
    "text": "Vall kadhta, rakaane, hun tutte na crease"
  },
  {
    "time": 36.05,
    "text": "Thoda rukkhe aan subhaa de, saanu aundi nahi tameej"
  },
  {
    "time": 38.72,
    "text": "Aah lai tainu ditti, saambh laa ni bebe aali chunni"
  },
  {
    "time": 41.67,
    "text": "Baitha double R vich paa ke bapu di kameej"
  },
  {
    "time": 44.32,
    "text": "Baahla door nahi, rakaane, hun ranjheyan nu Kheda"
  },
  {
    "time": 47.29,
    "text": "Baahla nede nu na jaavaan, bas jhaaka ee bada mera"
  },
  {
    "time": 49.93,
    "text": "Baahla rukaan na, rakaane, kite maaraan ikk phera"
  },
  {
    "time": 52.82,
    "text": "Naddhi do vall kha gayi, ditta ikk vaari geda"
  },
  {
    "time": 55.37,
    "text": "Kitthe dabe aan, rakaane, ehna dekh layi daba ke"
  },
  {
    "time": 58.49,
    "text": "Karaan shopping'an Milan Afghan aali kha ke"
  },
  {
    "time": 61.1,
    "text": "Tera darji, rakaane, change kar de Mohali"
  },
  {
    "time": 63.91,
    "text": "Jutti pairaan vich paavaan tere Paris'on manga ke"
  },
  {
    "time": 66.52,
    "text": "Tinn mahine, tinn change ne location'an, rakaane"
  },
  {
    "time": 69.62,
    "text": "Nitt UAE ton UK nu rotation'an, rakaane"
  },
  {
    "time": 72.1,
    "text": "Main taan rukjaan, dimaag saala rukda nahi mera"
  },
  {
    "time": 75.19,
    "text": "Taanhi laa laiye Samadhi Meditation'an, rakaane"
  },
  {
    "time": 77.66,
    "text": "Loki saade kolon sikh hun saanu den mattan"
  },
  {
    "time": 80.56,
    "text": "Saanu kinna kujh de gaiyan ni mitti diyan vattan"
  },
  {
    "time": 83.44,
    "text": "Jitthon langhe tera yaar, maare camera flash"
  },
  {
    "time": 86.11,
    "text": "Hun khichde ne photo, kade khichde si lattan"
  },
  {
    "time": 88.97,
    "text": "Kehndi, \"Akh na lagge ve jad di mari tere utte\""
  },
  {
    "time": 91.91,
    "text": "Saanu siddha ne bana gaye ni halaat saade putthe"
  },
  {
    "time": 94.42,
    "text": "Tu taan hune ee tang aa gayi, biba, neendraan uda ke"
  },
  {
    "time": 97.54,
    "text": "Saanu kayi saal ho gaye nahiyo changi tarah sutte"
  },
  {
    "time": 100.14,
    "text": "Naaraan thaar ke te vairi rakkhan saad ke, rakaane"
  },
  {
    "time": 103.11,
    "text": "Peende motor'an 'te chaahaan pattu kaadh ke, rakaane"
  },
  {
    "time": 105.65,
    "text": "Tere bullan de maare ne, main vi AKM laata"
  },
  {
    "time": 108.68,
    "text": "Hale navi aa Ferrari, jutti jhaad ke, rakaane"
  },
  {
    "time": 111.23,
    "text": "Dil todte, main chhe-chhe saak modte"
  },
  {
    "time": 113.46,
    "text": "Kataraan vich 18 hor pakkiyan"
  },
  {
    "time": 116.45,
    "text": "Dooron mattha tekdiyan, mud-mud dekhdiyan"
  },
  {
    "time": 119.29,
    "text": "Asi nahiyo ikk vaari takkiyan"
  },
  {
    "time": 122.12,
    "text": "Fan ikko naar da main, 10 vaari vaarda main"
  },
  {
    "time": 124.96,
    "text": "Ohde utton 100-100 diyan gatthiyan"
  },
  {
    "time": 127.67,
    "text": "Time laggu mitne nu, saanu thalle sittne nu"
  },
  {
    "time": 130.46,
    "text": "21 vaari jor laa laye chhattiyan"
  },
  {
    "time": 133.47,
    "text": "Oh, kudi jatt di fragrance door ton pachhane (yo)"
  },
  {
    "time": 136.5,
    "text": "Asi aashiqi 'ch navein, ni shikaari aan puraane"
  },
  {
    "time": 139.18,
    "text": "\"Gal sukda,\" kehndi, \"Tu jadon supne 'ch aave\""
  },
  {
    "time": 142.03,
    "text": "Naddhi odon di saundi aa paani rakh ke sirhaane"
  },
  {
    "time": 144.81,
    "text": "Main keha, chalde rakaane, sikke mittran de khote"
  },
  {
    "time": 147.87,
    "text": "Aa ke behnde aan rakaane, cheene mittran de kothe"
  },
  {
    "time": 150.35,
    "text": "Tainu sohniye rakaane, karaan hatthan naal chhaavaan"
  },
  {
    "time": 153.22,
    "text": "Jivein karde ne chhaavaan saade pindaan de barote"
  },
  {
    "time": 155.8,
    "text": "Tera 100 ton paar paara, ho gayi dhilli kujh kha ke"
  },
  {
    "time": 158.85,
    "text": "Teri taar daan najar gun powder chhua ke"
  },
  {
    "time": 161.51,
    "text": "Eh ton dar na, rakaane, dekh akkhan vich paa ke"
  },
  {
    "time": 164.47,
    "text": "Jadon chaldi Beretta, dindi surma bana ke"
  },
  {
    "time": 167.01,
    "text": "Kaafi kar layi kamayi, kaafi mittran ne uda layi (yo)"
  },
  {
    "time": 170.06,
    "text": "Thode humble aan, rakaane, Lambo neevi karva layi"
  },
  {
    "time": 172.58,
    "text": "Navein chhoran ton, rakaane, gaddi chaldi nahi siddhi"
  },
  {
    "time": 175.59,
    "text": "Laadan meech ke akkhan nu back ganne di trolly"
  },
  {
    "time": 178.17,
    "text": "Lagge gabhru di tod, kudi tutti payi nu aave"
  },
  {
    "time": 181.3,
    "text": "Age naar di, fasal jivein phutti payi nu aave"
  },
  {
    "time": 183.63,
    "text": "Meri yaad di maari nu tainu hichki, rakaane"
  },
  {
    "time": 186.81,
    "text": "Sachchi baarish de gaane waangu sutti payi nu aave"
  },
  {
    "time": 189.51,
    "text": "Bechain ho gayi, ikk kudi fan ho gayi"
  },
  {
    "time": 191.98,
    "text": "Aujle de kannan vich nattiyan"
  },
  {
    "time": 194.6,
    "text": "Karidi nahi care, kude, gaulde nahi sher, kude"
  },
  {
    "time": 197.35,
    "text": "Bhedaan hon 12 vaari katthiyan"
  },
  {
    "time": 200.25,
    "text": "Fan ikko naar da main, 10 vaari vaarda main"
  },
  {
    "time": 202.95,
    "text": "Ohde utton 100-100 diyan gatthiyan"
  },
  {
    "time": 205.65,
    "text": "Time laggu mitne nu, saanu thalle sittne nu"
  },
  {
    "time": 208.58,
    "text": "21 vaari jor laa laye chhattiyan"
  },
  {
    "time": 211.52,
    "text": "(Fan ikko naar da main, 10 vaari vaarda main)"
  },
  {
    "time": 214.22,
    "text": "(Ohde utton 100-100 diyan gatthiyan)"
  },
  {
    "time": 217.03,
    "text": "(Time laggu mitne nu, saanu thalle sittne nu)"
  },
  {
    "time": 219.88,
    "text": "(21 vaari jor laa laye chhattiyan)"
  }
]
  },
  {
    id: 'track-1',
    title: 'Starboy (feat. Daft Punk)',
    artist: 'The Weeknd',
    album: 'Starboy (Studio Master)',
    duration: 230,
    audioUrl: 'https://aac.saavncdn.com/396/b4e570050007b056c662f2a98c9f28ec_320.mp4',
    youtubeId: '3_g2un5M350',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#fa2d48',
    secondaryColor: '#8b5cf6',
    genre: 'R&B / Synthpop',
    year: 2026,
    plays: 2840900,
    lyrics: [
  {
    "time": 15.71,
    "text": "I'm tryna put you in the worst mood, ah"
  },
  {
    "time": 18.36,
    "text": "P1 cleaner than your church shoes, ah"
  },
  {
    "time": 20.98,
    "text": "Milli' point two just to hurt you, ah"
  },
  {
    "time": 23.46,
    "text": "All red Lamb' just to tease you, ah"
  },
  {
    "time": 26.05,
    "text": "None of these toys on lease too, ah"
  },
  {
    "time": 28.63,
    "text": "Made your whole year in a week too, yeah"
  },
  {
    "time": 31.24,
    "text": "Main bitch outta your league too, ah"
  },
  {
    "time": 33.7,
    "text": "Side bitch out of your league too, ah"
  },
  {
    "time": 36.68,
    "text": "House so empty, need a centerpiece"
  },
  {
    "time": 38.94,
    "text": "20 racks a table, cut from ebony"
  },
  {
    "time": 41.69,
    "text": "Cut that ivory into skinny pieces"
  },
  {
    "time": 43.83,
    "text": "Then she clean it with her face, man, I love my baby, ah"
  },
  {
    "time": 46.98,
    "text": "You talking money, need a hearing aid"
  },
  {
    "time": 49.51,
    "text": "You talking 'bout me, I don't see the shade"
  },
  {
    "time": 52.16,
    "text": "Switch up my style, I take any lane"
  },
  {
    "time": 54.35,
    "text": "I switch up my cup, I kill any pain"
  },
  {
    "time": 60.76,
    "text": "Look what you've done"
  },
  {
    "time": 65.72,
    "text": "I'm a motherfucking starboy"
  },
  {
    "time": 71.06,
    "text": "Look what you've done"
  },
  {
    "time": 76.03,
    "text": "I'm a motherfucking starboy"
  },
  {
    "time": 77.72,
    "text": "Every day a nigga try to test me, ah"
  },
  {
    "time": 80.25,
    "text": "Every day a nigga try to end me, ah"
  },
  {
    "time": 82.8,
    "text": "Pull off in that Roadster SV, ah"
  },
  {
    "time": 85.4,
    "text": "Pockets overweight, getting hefty, ah"
  },
  {
    "time": 88.01,
    "text": "Coming for the king, that's a far cry, I"
  },
  {
    "time": 90.72,
    "text": "I come alive in the fall time, I"
  },
  {
    "time": 93.33,
    "text": "The competition, I don't really listen"
  },
  {
    "time": 95.49,
    "text": "I'm in the blue Mulsanne bumping New Edition"
  },
  {
    "time": 98.58,
    "text": "House so empty, need a centerpiece"
  },
  {
    "time": 101.07,
    "text": "20 racks a table, cut from ebony"
  },
  {
    "time": 103.75,
    "text": "Cut that ivory into skinny pieces"
  },
  {
    "time": 105.8,
    "text": "Then she clean it with her face, man, I love my baby, ah"
  },
  {
    "time": 108.83,
    "text": "You talking money, need a hearing aid"
  },
  {
    "time": 111.44,
    "text": "You talking 'bout me, I don't see the shade"
  },
  {
    "time": 114.16,
    "text": "Switch up my style, I take any lane"
  },
  {
    "time": 116.39,
    "text": "I switch up my cup, I kill any pain"
  },
  {
    "time": 122.78,
    "text": "Look what you've done"
  },
  {
    "time": 127.6,
    "text": "I'm a motherfucking starboy"
  },
  {
    "time": 133.09,
    "text": "Look what you've done"
  },
  {
    "time": 137.86,
    "text": "I'm a motherfucking starboy"
  },
  {
    "time": 140.04,
    "text": "Let a nigga brag Pitt"
  },
  {
    "time": 141.79,
    "text": "Legend of the fall, took the year like a bandit"
  },
  {
    "time": 144.3,
    "text": "Bought mama a crib and a brand-new wagon"
  },
  {
    "time": 146.63,
    "text": "Now she hit the grocery shop looking lavish"
  },
  {
    "time": 149.4,
    "text": "Star Trek roof in that Wraith of Khan"
  },
  {
    "time": 151.86,
    "text": "Girls get loose when they hear this song"
  },
  {
    "time": 154.59,
    "text": "A hundred on the dash, get me close to God"
  },
  {
    "time": 156.87,
    "text": "We don't pray for love, we just pray for cars"
  },
  {
    "time": 160.49,
    "text": "House so empty, need a centerpiece"
  },
  {
    "time": 162.85,
    "text": "20 racks a table, cut from ebony"
  },
  {
    "time": 165.7,
    "text": "Cut that ivory into skinny pieces"
  },
  {
    "time": 167.71,
    "text": "Then she clean it with her face, man, I love my baby, ah"
  },
  {
    "time": 170.89,
    "text": "You talking money, need a hearing aid"
  },
  {
    "time": 173.31,
    "text": "You talking 'bout me, I don't see the shade"
  },
  {
    "time": 176.02,
    "text": "Switch up my style, I take any lane"
  },
  {
    "time": 178.2,
    "text": "I switch up my cup, I kill any pain"
  },
  {
    "time": 184.63,
    "text": "Look what you've done"
  },
  {
    "time": 189.65,
    "text": "I'm a motherfucking starboy"
  },
  {
    "time": 194.9,
    "text": "Look what you've done"
  },
  {
    "time": 199.92,
    "text": "I'm a motherfucking starboy"
  },
  {
    "time": 205.22,
    "text": "Look what you've done"
  },
  {
    "time": 210.35,
    "text": "I'm a motherfucking starboy"
  },
  {
    "time": 215.62,
    "text": "Look what you've done"
  },
  {
    "time": 220.56,
    "text": "I'm a motherfucking starboy"
  }
]
  },
  {
    id: 'track-2',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'Hit Me Hard and Soft',
    duration: 196,
    audioUrl: 'https://aac.saavncdn.com/707/761fa325ce0600e1463336f0431d82b3_320.mp4',
    youtubeId: 'd5gf9dXbPi0',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#0ea5e9',
    secondaryColor: '#6366f1',
    genre: 'Alternative Pop',
    year: 2026,
    plays: 1984500,
    lyrics: [
  {
    "time": 0.42,
    "text": "('Til I'm in the grave)"
  },
  {
    "time": 3.65,
    "text": "I want you to stay"
  },
  {
    "time": 8.22,
    "text": "'Til I'm in the grave"
  },
  {
    "time": 12.96,
    "text": "'Til I rot away, dead and buried"
  },
  {
    "time": 17.3,
    "text": "'Til I'm in the casket you carry"
  },
  {
    "time": 21.59,
    "text": "If you go, I'm going too, uh"
  },
  {
    "time": 26.45,
    "text": "'Cause it was always you, alright"
  },
  {
    "time": 31.08,
    "text": "And if I'm turnin' blue, please don't save me"
  },
  {
    "time": 35.79,
    "text": "Nothing left to lose without my baby"
  },
  {
    "time": 41.75,
    "text": "Birds of a feather, we should stick together, I know"
  },
  {
    "time": 46.34,
    "text": "I said I'd never think I wasn't better alone"
  },
  {
    "time": 50.84,
    "text": "Can't change the weather, might not be forever"
  },
  {
    "time": 54.64,
    "text": "But if it's forever, it's even better"
  },
  {
    "time": 60.04,
    "text": "And I don't know what I'm cryin' for"
  },
  {
    "time": 64.89,
    "text": "I don't think I could love you more"
  },
  {
    "time": 69.04,
    "text": "It might not be long, but baby, I"
  },
  {
    "time": 75.41,
    "text": "I'll love you 'til the day that I die"
  },
  {
    "time": 80.87,
    "text": "'Til the day that I die"
  },
  {
    "time": 85.32,
    "text": "'Til the light leaves my eyes"
  },
  {
    "time": 89.92,
    "text": "'Til the day that I die"
  },
  {
    "time": 95.14,
    "text": "I want you to see, hm"
  },
  {
    "time": 99.66,
    "text": "How you look to me, hm"
  },
  {
    "time": 104.27,
    "text": "You wouldn't believe if I told ya"
  },
  {
    "time": 108.89,
    "text": "You would keep the compliments I throw ya"
  },
  {
    "time": 113.28,
    "text": "But you're so full of shit, uh"
  },
  {
    "time": 117.92,
    "text": "Tell me it's a bit, no"
  },
  {
    "time": 122.52,
    "text": "Say you don't see it, your mind's polluted"
  },
  {
    "time": 127.18,
    "text": "Say you wanna quit, don't be stupid"
  },
  {
    "time": 133.18,
    "text": "And I don't know what I'm cryin' for"
  },
  {
    "time": 138,
    "text": "I don't think I could love you more"
  },
  {
    "time": 142.5,
    "text": "Might not be long, but baby, I"
  },
  {
    "time": 149.17,
    "text": "Don't wanna say goodbye"
  },
  {
    "time": 151.43,
    "text": "Birds of a feather, we should stick together, I know ('til the day that I die)"
  },
  {
    "time": 155.97,
    "text": "I said I'd never think I wasn't better alone ('til the light leaves my eyes)"
  },
  {
    "time": 160.52,
    "text": "Can't change the weather, might not be forever ('til the day I die)"
  },
  {
    "time": 164.35,
    "text": "But if it's forever, it's even better"
  },
  {
    "time": 169.95,
    "text": "I knew you in another life"
  },
  {
    "time": 174.88,
    "text": "You had that same look in your eyes"
  },
  {
    "time": 179.98,
    "text": "I love you, don't act so surprised"
  }
]
  },
  {
    id: 'track-3',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n’ Sweet',
    duration: 175,
    audioUrl: 'https://aac.saavncdn.com/111/cf81f6eb5b6768fe2e1ddf9335124a5f_320.mp4',
    youtubeId: 'eVli-tstM5E',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#d97706',
    secondaryColor: '#f59e0b',
    genre: 'Nu-Disco / Pop',
    year: 2026,
    plays: 2450000,
    lyrics: [
  {
    "time": 8.82,
    "text": "Now he's thinkin' 'bout me every night, oh"
  },
  {
    "time": 12.32,
    "text": "Is it that sweet? I guess so"
  },
  {
    "time": 14.53,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 16.88,
    "text": "That's that me espresso"
  },
  {
    "time": 19.14,
    "text": "Move it up, down, left, right, oh"
  },
  {
    "time": 21.5,
    "text": "Switch it up like Nintendo"
  },
  {
    "time": 23.82,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 26.13,
    "text": "That's that me espresso"
  },
  {
    "time": 28.78,
    "text": "I can't relate to desperation"
  },
  {
    "time": 33.37,
    "text": "My give-a-fucks are on vacation"
  },
  {
    "time": 38.05,
    "text": "And I got this one boy, and he won't stop callin'"
  },
  {
    "time": 42.69,
    "text": "When they act this way, I know I got 'em"
  },
  {
    "time": 46.73,
    "text": "Too bad your ex don't do it for ya"
  },
  {
    "time": 49.07,
    "text": "Walked in and dream-came-trued it for ya"
  },
  {
    "time": 51.36,
    "text": "Soft skin and I perfumed it for ya"
  },
  {
    "time": 55.65,
    "text": "(Yes) I know, I Mountain Dew it for ya"
  },
  {
    "time": 57.93,
    "text": "(Yes) that morning coffee, brewed it for ya"
  },
  {
    "time": 60.25,
    "text": "(Yes) one touch and I brand-newed it for ya (oh)"
  },
  {
    "time": 64.24,
    "text": "Now he's thinkin' 'bout me every night, oh"
  },
  {
    "time": 67.7,
    "text": "Is it that sweet? I guess so"
  },
  {
    "time": 69.96,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 72.37,
    "text": "That's that me espresso"
  },
  {
    "time": 74.51,
    "text": "Move it up, down, left, right, oh"
  },
  {
    "time": 76.88,
    "text": "Switch it up like Nintendo"
  },
  {
    "time": 79.05,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 81.51,
    "text": "That's that me espresso"
  },
  {
    "time": 84.13,
    "text": "Holy shit"
  },
  {
    "time": 86.21,
    "text": "Is it that sweet? I guess so"
  },
  {
    "time": 88.87,
    "text": "I'm working late, 'cause I'm a singer"
  },
  {
    "time": 93.39,
    "text": "Oh, he looks so cute wrapped 'round my finger"
  },
  {
    "time": 97.99,
    "text": "My twisted humor makes him laugh so often"
  },
  {
    "time": 102.69,
    "text": "My honey bee, come and get this pollen"
  },
  {
    "time": 106.62,
    "text": "Too bad your ex don't do it for ya"
  },
  {
    "time": 108.93,
    "text": "Walked in and dream-came-trued it for ya"
  },
  {
    "time": 111.28,
    "text": "Soft skin and I perfumed it for ya"
  },
  {
    "time": 115.65,
    "text": "(Yes) I know, I Mountain Dew it for ya"
  },
  {
    "time": 117.94,
    "text": "(Yes) that morning coffee, brewed it for ya"
  },
  {
    "time": 120.1,
    "text": "(Yes) one touch and I brand-newed it for ya (stupid)"
  },
  {
    "time": 124.29,
    "text": "Now he's thinkin' 'bout me every night, oh"
  },
  {
    "time": 127.62,
    "text": "Is it that sweet? I guess so"
  },
  {
    "time": 129.98,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 132.36,
    "text": "That's that me espresso"
  },
  {
    "time": 134.62,
    "text": "Move it up, down, left, right, oh"
  },
  {
    "time": 137.01,
    "text": "Switch it up like Nintendo"
  },
  {
    "time": 139.12,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 141.59,
    "text": "That's that me espresso"
  },
  {
    "time": 143.87,
    "text": "Thinkin' 'bout me every night, oh"
  },
  {
    "time": 146.15,
    "text": "Is it that sweet? I guess so (yes)"
  },
  {
    "time": 148.44,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 150.81,
    "text": "That's that me espresso (yes)"
  },
  {
    "time": 153.05,
    "text": "Move it up, down, left, right, oh"
  },
  {
    "time": 155.3,
    "text": "Switch it up like Nintendo (yes)"
  },
  {
    "time": 157.69,
    "text": "Say you can't sleep, baby, I know"
  },
  {
    "time": 160.06,
    "text": "That's that me espresso"
  },
  {
    "time": 164.68,
    "text": "Is it that sweet? I guess so, uh"
  },
  {
    "time": 169.14,
    "text": "That's that me espresso"
  }
]
  },
  {
    id: 'track-5',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    audioUrl: 'https://aac.saavncdn.com/077/0b02a92687d1ae3369b6859f44872e52_320.mp4',
    youtubeId: '4NRXx6U8ABQ',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#dc2626',
    secondaryColor: '#991b1b',
    genre: 'Synthwave / 80s Pop',
    year: 2026,
    plays: 4210000,
    lyrics: [
  {
    "time": 13.13,
    "text": "Yeah"
  },
  {
    "time": 27.16,
    "text": "I've been tryna call"
  },
  {
    "time": 29.96,
    "text": "I've been on my own for long enough"
  },
  {
    "time": 32.71,
    "text": "Maybe you can show me how to love, maybe"
  },
  {
    "time": 38.29,
    "text": "I'm goin' through withdrawals"
  },
  {
    "time": 41.23,
    "text": "You don't even have to do too much"
  },
  {
    "time": 44.12,
    "text": "You can turn me on with just a touch, baby"
  },
  {
    "time": 49.57,
    "text": "I look around and"
  },
  {
    "time": 50.62,
    "text": "Sin City's cold and empty (Oh)"
  },
  {
    "time": 53.53,
    "text": "No one's around to judge me (Oh)"
  },
  {
    "time": 56.24,
    "text": "I can't see clearly when you're gone"
  },
  {
    "time": 60.73,
    "text": "I said, \"Ooh, I'm blinded by the lights"
  },
  {
    "time": 66.69,
    "text": "No, I can't sleep until I feel your touch\" (Touch)"
  },
  {
    "time": 71.79,
    "text": "I said, \"Ooh, I'm drowning in the night"
  },
  {
    "time": 77.89,
    "text": "Oh, when I'm like this, you're the one I trust\""
  },
  {
    "time": 82.16,
    "text": "(Hey, hey, hey)"
  },
  {
    "time": 94.36,
    "text": "I'm running out of time"
  },
  {
    "time": 97.03,
    "text": "'Cause I can see the sun light up the sky"
  },
  {
    "time": 100.04,
    "text": "So I hit the road in overdrive, baby, oh"
  },
  {
    "time": 106.64,
    "text": "The city's cold and empty (Oh)"
  },
  {
    "time": 109.52,
    "text": "No one's around to judge me (Oh)"
  },
  {
    "time": 112.47,
    "text": "I can't see clearly when you're gone"
  },
  {
    "time": 116.98,
    "text": "I said, \"Ooh, I'm blinded by the lights"
  },
  {
    "time": 122.7,
    "text": "No, I can't sleep until I feel your touch\" (Touch)"
  },
  {
    "time": 127.94,
    "text": "I said, \"Ooh, I'm drowning in the night"
  },
  {
    "time": 134,
    "text": "Oh, when I'm like this, you're the one I trust\""
  },
  {
    "time": 139.17,
    "text": "I'm just coming back to let you know (Back to let you know)"
  },
  {
    "time": 142.16,
    "text": "I could never say it on the phone (Say it on the phone)"
  },
  {
    "time": 145.37,
    "text": "Will never let you go this time (Ooh)"
  },
  {
    "time": 150.27,
    "text": "I said, \"Ooh, I'm blinded by the lights"
  },
  {
    "time": 156.33,
    "text": "No, I can't sleep until I feel your touch\" (Touch)"
  },
  {
    "time": 160.5,
    "text": "(Hey, hey, hey)"
  },
  {
    "time": 171.73,
    "text": "(Hey, hey, hey)"
  },
  {
    "time": 183.9,
    "text": "I said, \"Ooh, I'm blinded by the lights"
  },
  {
    "time": 190.12,
    "text": "No, I can't sleep until I feel your touch\""
  }
]
  },
  {
    id: 'track-6',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    album: 'Viva la Vida or Death and All His Friends',
    duration: 242,
    audioUrl: 'https://aac.saavncdn.com/150/228516bdb7d5e91d4e32f27453a581b1_320.mp4',
    youtubeId: 'dvgZkm1xWPE',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#ca8a04',
    secondaryColor: '#eab308',
    genre: 'Baroque Pop / Rock',
    year: 2026,
    plays: 3100000,
    lyrics: [
  {
    "time": 13.06,
    "text": "I used to rule the world"
  },
  {
    "time": 16.75,
    "text": "Seas would rise when I gave the word"
  },
  {
    "time": 19.23,
    "text": "Now in the morning, I sleep alone"
  },
  {
    "time": 23.55,
    "text": "Sweep the streets I used to own"
  },
  {
    "time": 40.54,
    "text": "I used to roll the dice"
  },
  {
    "time": 44.6,
    "text": "Feel the fear in my enemy's eyes"
  },
  {
    "time": 47.86,
    "text": "Listened as the crowd would sing"
  },
  {
    "time": 51.67,
    "text": "\"Now the old king is dead, long live the king\""
  },
  {
    "time": 54.51,
    "text": "One minute I held the key"
  },
  {
    "time": 58.48,
    "text": "Next, the walls were closed on me"
  },
  {
    "time": 61.15,
    "text": "And I discovered that my castles stand"
  },
  {
    "time": 65.41,
    "text": "Upon pillars of salt and pillars of sand"
  },
  {
    "time": 69.23,
    "text": "I hear Jerusalem bells a-ringing"
  },
  {
    "time": 73.11,
    "text": "Roman cavalry choirs are singing"
  },
  {
    "time": 76.57,
    "text": "Be my mirror, my sword and shield"
  },
  {
    "time": 79.69,
    "text": "My missionaries in a foreign field"
  },
  {
    "time": 83.49,
    "text": "For some reason, I can't explain"
  },
  {
    "time": 86.89,
    "text": "Once you'd gone, there was never"
  },
  {
    "time": 89.52,
    "text": "Never an honest word"
  },
  {
    "time": 93.23,
    "text": "And that was when I ruled the world"
  },
  {
    "time": 109.88,
    "text": "It was a wicked and wild wind"
  },
  {
    "time": 114.05,
    "text": "Blew down the doors to let me in"
  },
  {
    "time": 116.74,
    "text": "Shattered windows and the sound of drums"
  },
  {
    "time": 121.1,
    "text": "People couldn't believe what I'd become"
  },
  {
    "time": 124.29,
    "text": "Revolutionaries wait"
  },
  {
    "time": 128.13,
    "text": "For my head on a silver plate"
  },
  {
    "time": 130.58,
    "text": "Just a puppet on a lonely string"
  },
  {
    "time": 135.15,
    "text": "Oh, who would ever want to be king?"
  },
  {
    "time": 138.92,
    "text": "I hear Jerusalem bells a-ringing"
  },
  {
    "time": 142.52,
    "text": "Roman cavalry choirs are singing"
  },
  {
    "time": 145.93,
    "text": "Be my mirror, my sword and shield"
  },
  {
    "time": 149.39,
    "text": "My missionaries in a foreign field"
  },
  {
    "time": 152.87,
    "text": "For some reason, I can't explain"
  },
  {
    "time": 156.45,
    "text": "I know Saint Peter won't call my name"
  },
  {
    "time": 159.64,
    "text": "Never an honest word"
  },
  {
    "time": 162.71,
    "text": "But that was when I ruled the world"
  },
  {
    "time": 195.05,
    "text": "Hear Jerusalem bells a-ringing"
  },
  {
    "time": 198.1,
    "text": "Roman cavalry choirs are singing"
  },
  {
    "time": 201.68,
    "text": "Be my mirror, my sword and shield"
  },
  {
    "time": 204.96,
    "text": "My missionaries in a foreign field"
  },
  {
    "time": 208.58,
    "text": "For some reason, I can't explain"
  },
  {
    "time": 212.04,
    "text": "I know Saint Peter won't call my name"
  },
  {
    "time": 215.18,
    "text": "Never an honest word"
  },
  {
    "time": 218.42,
    "text": "But that was when I ruled the world"
  }
]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-bollywood',
    name: 'Bollywood Romance & Melodies',
    description: 'Soulful Hindi acoustics & romantic anthems featuring Arijit Singh, Pritam & Sachin-Jigar.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    trackIds: ['track-4', 'track-7', 'track-8', 'track-9', 'track-12', 'track-13', 'track-14', 'track-15'],
    isCustom: false,
    createdAt: '2026-11-07'
  },
  {
    id: 'playlist-punjabi',
    name: 'Punjabi Wave & Bhangra Highs',
    description: 'Top Punjabi hits from Diljit Dosanjh, Karan Aujla, and driving urban beats.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    trackIds: ['track-10', 'track-11', 'track-18', 'track-19'],
    isCustom: false,
    createdAt: '2026-11-07'
  },
  {
    id: 'playlist-top-hits',
    name: "Today's Global Top Hits",
    description: 'The biggest streaming records on earth, remastered with Dolby Atmos 3D spatial staging.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-2', 'track-3', 'track-5', 'track-6'],
    isCustom: false,
    createdAt: '2026-11-07'
  },
  {
    id: 'playlist-audiophile',
    name: 'Spatial Audio Masters',
    description: 'Immersive soundscapes engineered for AirPods Pro, Sony XM5, and high-fidelity studio headphones.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    trackIds: ['track-4', 'track-7', 'track-10', 'track-1'],
    isCustom: false,
    createdAt: '2026-11-07'
  }
];

export const GENRES = [
  { name: 'Bollywood & Hindi', color: 'from-amber-500 to-rose-600' },
  { name: 'Punjabi Wave', color: 'from-orange-500 to-red-600' },
  { name: 'Pop & Chart Hits', color: 'from-pink-500 to-rose-600' },
  { name: 'Hip-Hop & Rap', color: 'from-orange-500 to-amber-600' },
  { name: 'R&B / Soul', color: 'from-purple-600 to-indigo-700' },
  { name: 'Synthwave & Electronic', color: 'from-cyan-500 to-blue-600' },
  { name: 'Chill & Lo-Fi', color: 'from-emerald-500 to-teal-700' },
];
