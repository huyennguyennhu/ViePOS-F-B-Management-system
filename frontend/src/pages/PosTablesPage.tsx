import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cardAPI, productAPI } from '../services/api';
import { Plus, AlertTriangle, RefreshCw, Search, X } from 'lucide-react';
import './PosTablesPage.css';

interface Card {
  id: number;
  cardNumber: string;
  status: string; // "trống", "Đang sử dụng", "quá giờ", "khóa"
}

interface CardSession {
  id: number;
  card: Card;
  startTime: string;
  endTime: string;
  actualEndTime: string | null;
  orderId: string;
  status: string; // "Đang sử dụng", "Hoàn thành", "Quá giờ"
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  imageUrl: string | null;
  status: string;
  category: Category;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, sku: 'CF-DEN-01', name: 'Cà phê đen', imageUrl: null, status: 'Đang bán', category: { id: 1, name: 'Cà phê' } },
  { id: 2, sku: 'CF-SUA-02', name: 'Cà phê sữa', imageUrl: null, status: 'Đang bán', category: { id: 1, name: 'Cà phê' } },
  { id: 3, sku: 'TS-DAC-01', name: 'Trà sữa đặc sản', imageUrl: null, status: 'Đang bán', category: { id: 2, name: 'Trà sữa' } },
  { id: 4, sku: 'TS-TRU-02', name: 'Trà sữa truyền thống', imageUrl: null, status: 'Đang bán', category: { id: 2, name: 'Trà sữa' } },
  { id: 5, sku: 'NE-DEP-01', name: 'Đẹp da', imageUrl: null, status: 'Đang bán', category: { id: 3, name: 'Nước ép' } },
  { id: 6, sku: 'NE-DAN-02', name: 'Đẹp dáng', imageUrl: null, status: 'Đang bán', category: { id: 3, name: 'Nước ép' } },
  { id: 7, sku: 'TR-NHT-01', name: 'Trà trái cây nhiệt đới', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 8, sku: 'TR-MAN-02', name: 'Trà mãng cầu', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 9, sku: 'TR-OIH-03', name: 'Trà ổi hồng', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 10, sku: 'TR-HIB-04', name: 'Trà Hibiscus', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 11, sku: 'TR-XOA-05', name: 'Trà xoài chanh leo', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 12, sku: 'TR-DET-06', name: 'Trà detox nóng', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 13, sku: 'AV-MILY-01', name: 'Mì ly', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
  { id: 14, sku: 'AV-BGAU-02', name: 'Bánh gấu', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
  { id: 15, sku: 'AV-BQUE-03', name: 'Bánh que', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
  { id: 16, sku: 'AV-BTM-04', name: 'Bánh tai mèo', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } }
];

// Helper function to robustly parse UTC server time to browser local time
const parseServerDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const hasZ = dateStr.endsWith('Z');
  const hasOffset = /([+-]\d{2}:\d{2})$/.test(dateStr);
  const formattedStr = (hasZ || hasOffset) ? dateStr : `${dateStr}Z`;
  return new Date(formattedStr);
};

// Helper function to dynamically decode cart products stored inside orderId
const decodeOrderIdToItems = (orderId: string, allProducts: Product[]) => {
  if (!orderId) return [];
  const parts = orderId.split('-');
  if (parts.length < 3) return [];
  
  const itemsPart = parts[2];
  const itemStrings = itemsPart.split('|');
  
  return itemStrings.map(itemStr => {
    const segments = itemStr.split('_');
    if (segments.length < 4) return null;
    const sku = segments[0];
    const quantity = parseInt(segments[1]) || 1;
    const serveType = segments[2] === 't' ? 'takeaway' : 'dine_in';
    const duration = segments[3] === '4' ? '4h' : 'all_day';
    
    const product = allProducts.find(p => p.sku === sku);
    if (!product) return null;
    
    let basePrice = 0;
    if (serveType === 'takeaway') {
      basePrice = 25000;
    } else {
      basePrice = duration === '4h' ? 35000 : 45000;
    }
    
    return {
      name: product.name,
      sku: product.sku,
      serveType,
      duration,
      quantity,
      price: basePrice,
      note: ''
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
};

export default function PosTablesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const openCardNumber = location.state?.openCardNumber as string | undefined;
  const [cards, setCards] = useState<Card[]>([]);
  const [sessions, setSessions] = useState<CardSession[]>([]);
  const [productList, setProductList] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '4h' | 'all_day' | 'near_overdue'>('all');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Track detailed order metadata including items list
  const [ordersMetadata, setOrdersMetadata] = useState<Record<string, { 
    itemCount: number;
    items?: Array<{
      name: string;
      sku: string;
      serveType: 'takeaway' | 'dine_in';
      duration: '4h' | 'all_day';
      quantity: number;
      price: number;
      note?: string;
    }>;
  }>>({});

  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<CardSession | null>(null);

  // Trả thẻ popup states
  const [releaseConfirmCard, setReleaseConfirmCard] = useState<string | null>(null);
  const [releaseSuccessCard, setReleaseSuccessCard] = useState<string | null>(null);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);

  // Real-time ticking timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-open detail popup if navigated back from add-items flow
  useEffect(() => {
    if (!openCardNumber || sessions.length === 0) return;
    const session = sessions.find(
      s => s.card.cardNumber === openCardNumber && !s.actualEndTime && s.status !== 'Hoàn thành'
    );
    if (session) {
      setSelectedSessionForDetail(session);
      // Clear the state so it doesn't re-open on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [openCardNumber, sessions, location.pathname, navigate]);

  // Auto-close success popup after 2.5s
  useEffect(() => {
    if (!releaseSuccessCard) return;
    const t = setTimeout(() => setReleaseSuccessCard(null), 2500);
    return () => clearTimeout(t);
  }, [releaseSuccessCard]);

  // Fetch orders metadata from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pos_orders_metadata');
      let metadata = saved ? JSON.parse(saved) : {};
      
      // Ensure mock data exists for live-demo cards
      const mockMetadata = {
        'ORD-MOCK-04': {
          itemCount: 1,
          items: [
            { name: 'Cà phê đen', sku: 'CF-DEN-01', serveType: 'dine_in', duration: '4h', quantity: 1, price: 35000, note: 'Ít đường' }
          ]
        },
        'ORD-MOCK-08-1': {
          itemCount: 2,
          items: [
            { name: 'Trà sữa truyền thống', sku: 'TS-TRU-02', serveType: 'dine_in', duration: '4h', quantity: 1, price: 35000 },
            { name: 'Bánh gấu', sku: 'AV-BGAU-02', serveType: 'takeaway', duration: 'all_day', quantity: 1, price: 25000 }
          ]
        },
        'ORD-MOCK-08-2': {
          itemCount: 2,
          items: [
            { name: 'Trà sữa đặc sản', sku: 'TS-DAC-01', serveType: 'dine_in', duration: '4h', quantity: 1, price: 35000 },
            { name: 'Bánh que', sku: 'AV-BQUE-03', serveType: 'takeaway', duration: 'all_day', quantity: 1, price: 25000 }
          ]
        },
        'ORD-MOCK-03-1': {
          itemCount: 1,
          items: [
            { name: 'Trà trái cây nhiệt đới', sku: 'TR-NHT-01', serveType: 'dine_in', duration: '4h', quantity: 1, price: 35000 }
          ]
        },
        'ORD-MOCK-03-2': {
          itemCount: 1,
          items: [
            { name: 'Đẹp da', sku: 'NE-DEP-01', serveType: 'dine_in', duration: 'all_day', quantity: 1, price: 45000 }
          ]
        }
      };

      // Merge mock metadata with actual ones
      metadata = { ...mockMetadata, ...metadata };
      localStorage.setItem('pos_orders_metadata', JSON.stringify(metadata));
      setOrdersMetadata(metadata);
    } catch (e) {
      console.error(e);
    }
  }, [cards, sessions]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [cardsRes, sessionsRes, productsRes] = await Promise.all([
        cardAPI.getCards(),
        cardAPI.getSessions(),
        productAPI.getProducts().catch(errProd => {
          console.error('Không thể tải danh sách sản phẩm từ backend, sử dụng dữ liệu mặc định:', errProd);
          return null;
        })
      ]);

      if (productsRes?.data) {
        setProductList(productsRes.data);
      }
      
      // Sort cards by card number ascending
      const sortedCards = [...cardsRes.data].sort((a, b) => 
        parseInt(a.cardNumber) - parseInt(b.cardNumber)
      );
      setCards(sortedCards);
      
      // Sort sessions by start time descending
      const sortedSessions = [...sessionsRes.data].sort((a, b) => 
        parseServerDate(b.startTime).getTime() - parseServerDate(a.startTime).getTime()
      );
      setSessions(sortedSessions);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu thẻ/phiên:', err);
      setErrorMessage('Không thể kết nối đến máy chủ. Đang sử dụng dữ liệu giả lập.');
      
      // Seed fallback data for testing
      setCards([
        { id: 1, cardNumber: '04', status: 'quá giờ' },
        { id: 2, cardNumber: '08', status: 'Đang sử dụng' },
        { id: 3, cardNumber: '08', status: 'Đang sử dụng' }, // Let's have another card 08 for demo
        { id: 4, cardNumber: '03', status: 'Đang sử dụng' },
        { id: 5, cardNumber: '03', status: 'Đang sử dụng' }, // Second card 03 for Cả ngày
        { id: 6, cardNumber: '07', status: 'trống' },
        { id: 7, cardNumber: '11', status: 'khóa' },
      ]);

      const now = new Date();
      const start4 = new Date(now.getTime() - (4 * 60 * 60 + 2 * 60 + 43) * 1000);
      const end4 = new Date(start4.getTime() + 4 * 60 * 60 * 1000); // overdue now
      
      const start8 = new Date(now.getTime() - (3 * 60 * 60 + 45 * 60 + 58) * 1000);
      const end8 = new Date(start8.getTime() + 4 * 60 * 60 * 1000); // 14m 2s left

      const start8_2 = new Date(now.getTime() - (3 * 60 * 60 + 45 * 60 + 58) * 1000);
      const end8_2 = new Date(start8_2.getTime() + 4 * 60 * 60 * 1000);

      const start3 = new Date(now.getTime() - (5 * 60 + 17) * 1000);
      const end3 = new Date(start3.getTime() + 4 * 60 * 60 * 1000); // 3h 54m 43s left

      const start3_2 = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      const end3_2 = new Date(now);
      end3_2.setHours(22, 0, 0, 0);

      setSessions([
        {
          id: 1,
          card: { id: 1, cardNumber: '04', status: 'quá giờ' },
          startTime: start4.toISOString(),
          endTime: end4.toISOString(),
          actualEndTime: null,
          orderId: 'ORD-MOCK-04',
          status: 'Quá giờ'
        },
        {
          id: 2,
          card: { id: 2, cardNumber: '08', status: 'Đang sử dụng' },
          startTime: start8.toISOString(),
          endTime: end8.toISOString(),
          actualEndTime: null,
          orderId: 'ORD-MOCK-08-1',
          status: 'Đang sử dụng'
        },
        {
          id: 3,
          card: { id: 3, cardNumber: '08', status: 'Đang sử dụng' },
          startTime: start8_2.toISOString(),
          endTime: end8_2.toISOString(),
          actualEndTime: null,
          orderId: 'ORD-MOCK-08-2',
          status: 'Đang sử dụng'
        },
        {
          id: 4,
          card: { id: 4, cardNumber: '03', status: 'Đang sử dụng' },
          startTime: start3.toISOString(),
          endTime: end3.toISOString(),
          actualEndTime: null,
          orderId: 'ORD-MOCK-03-1',
          status: 'Đang sử dụng'
        },
        {
          id: 5,
          card: { id: 5, cardNumber: '03', status: 'Đang sử dụng' },
          startTime: start3_2.toISOString(),
          endTime: end3_2.toISOString(),
          actualEndTime: null,
          orderId: 'ORD-MOCK-03-2',
          status: 'Đang sử dụng'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRelease = (cardNumber: string) => {
    setReleaseConfirmCard(cardNumber);
    setReleaseError(null);
  };

  const handleReleaseConfirmed = async () => {
    if (!releaseConfirmCard) return;
    setReleaseLoading(true);
    setReleaseError(null);
    setSelectedSessionForDetail(null); // Đóng ngay popup chi tiết
    try {
      await cardAPI.releaseCard(releaseConfirmCard);
      // Update state locally - no full reload
      setCards(prev => prev.map(c =>
        c.cardNumber === releaseConfirmCard ? { ...c, status: 'trống' } : c
      ));
      setSessions(prev => prev.map(s =>
        s.card.cardNumber === releaseConfirmCard && !s.actualEndTime
          ? { ...s, actualEndTime: new Date().toISOString(), status: 'Hoàn thành' }
          : s
      ));
      setReleaseConfirmCard(null);
      setReleaseSuccessCard(releaseConfirmCard);
    } catch (err) {
      console.error(err);
      setReleaseError('Không thể thực hiện trả thẻ. Vui lòng thử lại.');
    } finally {
      setReleaseLoading(false);
    }
  };

  const handleToggleLock = async (card: Card) => {
    const newStatus = card.status === 'khóa' ? 'trống' : 'khóa';
    try {
      await cardAPI.updateCardStatus(card.cardNumber, newStatus);
      alert(`Đã ${newStatus === 'khóa' ? 'Khóa' : 'Mở khóa'} thẻ số ${card.cardNumber}!`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật trạng thái khóa thẻ.');
    }
  };

  // Filter logic
  const filteredCards = cards.filter(card => {
    // 1. Search Query filter (by card number)
    if (searchQuery && !card.cardNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Find active session
    const activeSession = sessions.find(
      s => s.card.cardNumber === card.cardNumber &&
           s.status !== 'Hoàn thành' &&
           !s.actualEndTime
    );

    // 2. Tab Filter
    if (selectedFilter === 'all') return true;

    if (!activeSession) {
      return false;
    }

    const diffMs = parseServerDate(activeSession.endTime).getTime() - parseServerDate(activeSession.startTime).getTime();
    const is4h = [4, 8, 12, 16, 20, 24].some(h => Math.abs(diffMs - h * 60 * 60 * 1000) < 60000);
    const durationType = is4h ? '4h' : 'all_day';

    const remainingTimeMs = parseServerDate(activeSession.endTime).getTime() - currentTime.getTime();
    const isOverdue = remainingTimeMs < 0;
    const isNearOverdue = !isOverdue && remainingTimeMs <= 15 * 60 * 1000;

    if (selectedFilter === '4h') {
      return durationType === '4h';
    }
    if (selectedFilter === 'all_day') {
      return durationType === 'all_day';
    }
    if (selectedFilter === 'near_overdue') {
      return isOverdue || isNearOverdue;
    }

    return true;
  });

  // Sort logic based on status priority: Overdue (Red) > Near Overdue (Yellow) > In Use (Green) > Free (Grey) > Locked (Grey)
  const getCardStatusWeight = (card: Card) => {
    const activeSession = sessions.find(
      s => s.card.cardNumber === card.cardNumber &&
           s.status !== 'Hoàn thành' &&
           !s.actualEndTime
    );

    if (activeSession) {
      const remainingTimeMs = parseServerDate(activeSession.endTime).getTime() - currentTime.getTime();
      const isOverdue = remainingTimeMs < 0;
      const isNearOverdue = !isOverdue && remainingTimeMs <= 15 * 60 * 1000;

      if (isOverdue) return 1; // Quá giờ (Red)
      if (isNearOverdue) return 2; // Sắp hết giờ (Yellow)
      return 3; // Đang sử dụng (Green)
    }

    if (card.status === 'khóa') return 5; // Khóa (Grey)
    return 4; // Trống (Grey)
  };

  const getCardRemainingTime = (card: Card) => {
    const activeSession = sessions.find(
      s => s.card.cardNumber === card.cardNumber &&
           s.status !== 'Hoàn thành' &&
           !s.actualEndTime
    );
    if (activeSession) {
      return parseServerDate(activeSession.endTime).getTime() - currentTime.getTime();
    }
    return Infinity;
  };

  const sortedCards = [...filteredCards].sort((a, b) => {
    const weightA = getCardStatusWeight(a);
    const weightB = getCardStatusWeight(b);
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    if (weightA <= 3) {
      return getCardRemainingTime(a) - getCardRemainingTime(b);
    }
    return parseInt(a.cardNumber) - parseInt(b.cardNumber);
  });

  return (
    <div className="pos-tables-page">
      {/* Centered Header with subtitle/action */}
      <div className="tables-header-centered">
        <div style={{ width: '36px' }}></div>
        <h1 className="tables-title-text">Bàn</h1>
        <button className="btn-refresh-subtle" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {errorMessage && (
        <div className="tables-alert-warning">
          {errorMessage}
        </div>
      )}

      {/* Search Box */}
      <div className="tables-search-row">
        <div className="tables-search-container">
          <Search size={18} color="#a0a0a0" />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="tables-search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Pill Filter Container */}
      <div className="filter-pills-container">
        <div className="filter-pills-scroll">
          <button 
            className={`pill-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`pill-btn ${selectedFilter === '4h' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('4h')}
          >
            4H
          </button>
          <button 
            className={`pill-btn ${selectedFilter === 'all_day' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all_day')}
          >
            Cả ngày
          </button>
          <button 
            className={`pill-btn ${selectedFilter === 'near_overdue' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('near_overdue')}
          >
            Sắp hết giờ
          </button>
        </div>
        {/* <button className="pill-arrow-btn">
          <span>&rsaquo;</span>
        </button> */}
      </div>

      {/* Cards Grid */}
      <div className="tables-tab-content">
        {loading ? (
          <div className="no-cards-found">Đang tải dữ liệu...</div>
        ) : sortedCards.length === 0 ? (
          <div className="no-cards-found">Không tìm thấy thẻ bàn nào phù hợp.</div>
        ) : (
          <div className="cards-grid-mockup">
            {sortedCards.map((card, idx) => {
              const activeSession = sessions.find(
                s => s.card.cardNumber === card.cardNumber &&
                     s.status !== 'Hoàn thành' &&
                     !s.actualEndTime
              );

              let statusColor: 'overdue' | 'near-overdue' | 'in-use' | 'free' | 'locked' = 'free';
              let badgeText = 'Trống';
              let timerStr = 'TRỐNG';
              let subText = '';
              let durationType: '4h' | 'all_day' | null = null;

              if (activeSession) {
                const diffMs = parseServerDate(activeSession.endTime).getTime() - parseServerDate(activeSession.startTime).getTime();
                const is4h = [4, 8, 12, 16, 20, 24].some(h => Math.abs(diffMs - h * 60 * 60 * 1000) < 60000);
                durationType = is4h ? '4h' : 'all_day';

                const remainingTimeMs = parseServerDate(activeSession.endTime).getTime() - currentTime.getTime();
                const isOverdue = remainingTimeMs < 0;
                const isNearOverdue = !isOverdue && remainingTimeMs <= 15 * 60 * 1000;

                if (isOverdue) {
                  statusColor = 'overdue';
                  badgeText = 'Quá giờ';
                  
                  const elapsedMs = Math.abs(remainingTimeMs);
                  const hours = Math.floor(elapsedMs / (3600 * 1000));
                  const mins = Math.floor((elapsedMs % (3600 * 1000)) / (60 * 1000));
                  const secs = Math.floor((elapsedMs % (60 * 1000)) / 1000);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  timerStr = `-${pad(hours)} : ${pad(mins)} : ${pad(secs)}`;
                } else if (isNearOverdue) {
                  statusColor = 'near-overdue';
                  badgeText = 'Sắp hết giờ';

                  const hours = Math.floor(remainingTimeMs / (3600 * 1000));
                  const mins = Math.floor((remainingTimeMs % (3600 * 1000)) / (60 * 1000));
                  const secs = Math.floor((remainingTimeMs % (60 * 1000)) / 1000);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  timerStr = `${pad(hours)} : ${pad(mins)} : ${pad(secs)}`;
                } else {
                  statusColor = 'in-use';
                  badgeText = durationType === '4h' ? '4H' : 'Cả ngày';

                  if (durationType === '4h') {
                    const hours = Math.floor(remainingTimeMs / (3600 * 1000));
                    const mins = Math.floor((remainingTimeMs % (3600 * 1000)) / (60 * 1000));
                    const secs = Math.floor((remainingTimeMs % (60 * 1000)) / 1000);
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    timerStr = `${pad(hours)} : ${pad(mins)} : ${pad(secs)}`;
                  } else {
                    timerStr = 'CẢ NGÀY';
                  }
                }

                const startTimeStr = parseServerDate(activeSession.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                
                // Get item count from metadata or decoded orderId
                let itemCount = ordersMetadata[activeSession.orderId]?.itemCount;
                if (itemCount === undefined) {
                  const decoded = decodeOrderIdToItems(activeSession.orderId, productList);
                  if (decoded.length > 0) {
                    itemCount = decoded.reduce((sum, it) => sum + it.quantity, 0);
                  }
                }
                if (itemCount === undefined) {
                  if (card.cardNumber === '04') itemCount = 1;
                  else if (card.cardNumber === '08') itemCount = 2;
                  else if (card.cardNumber === '03') itemCount = 1;
                  else itemCount = 1;
                }
                subText = `Vào lúc ${startTimeStr} | ${itemCount} món`;
              } else if (card.status === 'khóa') {
                statusColor = 'locked';
                badgeText = 'Đã khóa';
                timerStr = 'ĐÃ KHÓA';
              }

              const uniqueKey = `${card.id}-${card.cardNumber}-${idx}`;

              return (
                <div 
                  key={uniqueKey} 
                  className={`table-card-box ${statusColor} ${activeSession ? 'clickable' : ''}`}
                  onClick={() => {
                    if (activeSession) {
                      setSelectedSessionForDetail(activeSession);
                    }
                  }}
                  style={activeSession ? { cursor: 'pointer' } : {}}
                >
                  {/* Card Header Section */}
                  <div className="table-card-header">
                    <span className="table-card-number">#{card.cardNumber}</span>
                    <span className="table-card-badge-tag">
                      {statusColor === 'overdue' && <AlertTriangle size={10} style={{ marginRight: '2px', display: 'inline', verticalAlign: 'middle' }} />}
                      {badgeText}
                    </span>
                  </div>

                  {/* Card Body Section */}
                  <div className="table-card-body">
                    <div className="table-card-timer">{timerStr}</div>
                    {subText && <div className="table-card-subtext">{subText}</div>}
                    
                    {/* Action Buttons Row */}
                    <div className="table-card-actions">
                      {activeSession ? (
                        <>
                          {durationType === '4h' && (
                            <button 
                              className="card-plus-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/pos/sales', { state: { lockedCardNumber: card.cardNumber } });
                              }}
                              title="Thêm món"
                            >
                              <Plus size={16} />
                            </button>
                          )}
                          <button 
                            className="card-checkout-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRelease(card.cardNumber);
                            }}
                          >
                            TRẢ THẺ
                          </button>
                        </>
                      ) : statusColor === 'locked' ? (
                        <button 
                          className="card-wide-unlock-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLock(card);
                          }}
                        >
                          MỞ KHÓA
                        </button>
                      ) : (
                        <button 
                          className="card-wide-plus-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/pos/sales');
                          }}
                          title="Tạo phiên thẻ mới"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Chi tiết bàn */}
      {selectedSessionForDetail && (
        <div className="tables-modal-overlay" onClick={() => setSelectedSessionForDetail(null)}>
          <div className="tables-detail-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="tables-sheet-header">
              <h2 className="tables-sheet-title" style={{ color: '#349409', fontSize: '24px' }}>#{selectedSessionForDetail.card.cardNumber}</h2>
              <button className="tables-sheet-close" onClick={() => setSelectedSessionForDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="tables-sheet-body">
              <div className="tables-detail-info-grid">
                {/* 
                <div className="tables-info-item">
                  <span className="tables-info-label">Mã đơn:</span>
                  <span className="tables-info-value font-mono" style={{ fontSize: '20px', fontWeight: 800, color: '#349409', letterSpacing: '2px' }}>
                    {ordersMetadata[selectedSessionForDetail.orderId]?.displayId
                      ?? selectedSessionForDetail.orderId.split('-').pop()
                      ?? selectedSessionForDetail.orderId}
                  </span>
                </div>
                */}
                <div className="tables-info-item">
                  <span className="tables-info-label">Ngày:</span>
                  <span className="tables-info-value">
                    {parseServerDate(selectedSessionForDetail.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <div className="tables-info-item">
                  <span className="tables-info-label">Giờ vào:</span>
                  <span className="tables-info-value">
                    {parseServerDate(selectedSessionForDetail.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {(() => {
                  const diffMs = parseServerDate(selectedSessionForDetail.endTime).getTime() - parseServerDate(selectedSessionForDetail.startTime).getTime();
                  const is4h = [4, 8, 12, 16, 20, 24].some(h => Math.abs(diffMs - h * 60 * 60 * 1000) < 60000);
                  if (!is4h) return null;
                  
                  return (
                    <>
                      <div className="tables-info-item">
                        <span className="tables-info-label">Dự kiến ra:</span>
                        <span className="tables-info-value">
                          {parseServerDate(selectedSessionForDetail.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="tables-info-item">
                        <span className="tables-info-label">Thời gian còn lại:</span>
                        <span className="tables-info-value" style={{ color: '#C42326', fontWeight: 800, fontSize: '16px' }}>
                          {(() => {
                            const remainingTimeMs = parseServerDate(selectedSessionForDetail.endTime).getTime() - currentTime.getTime();
                            const isOverdue = remainingTimeMs < 0;
                            const elapsedMs = Math.abs(remainingTimeMs);
                            const hours = Math.floor(elapsedMs / (3600 * 1000));
                            const mins = Math.floor((elapsedMs % (3600 * 1000)) / (60 * 1000));
                            const secs = Math.floor((elapsedMs % (60 * 1000)) / 1000);
                            const pad = (n: number) => n.toString().padStart(2, '0');
                            return `${isOverdue ? '-' : ''}${pad(hours)}:${pad(mins)}:${pad(secs)}`;
                          })()}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="tables-products-section">
                <h3 className="tables-section-title">Danh sách món nước & dịch vụ</h3>
                <div className="tables-products-table-wrapper">
                  <table className="tables-products-table">
                    <thead>
                      <tr>
                        {/* <th style={{ width: '30px', textAlign: 'center' }}>STT</th> */}
                        <th>SẢN PHẨM</th>
                        <th style={{ width: '65px', textAlign: 'right' }}>GIÁ</th>
                        <th style={{ width: '30px', textAlign: 'center' }}>SL</th>
                        <th style={{ width: '70px', textAlign: 'right' }}>TỔNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Decode directly from orderId first
                        let items = decodeOrderIdToItems(selectedSessionForDetail.orderId, productList);
                        
                        // Fallback to local storage if orderId decoding was empty
                        if (items.length === 0) {
                          const metadata = ordersMetadata[selectedSessionForDetail.orderId];
                          items = metadata?.items || [];
                        }
                        
                        if (items.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="tables-no-products" style={{ backgroundColor: 'transparent' }}>
                                Chưa có thông tin chi tiết món cho đơn hàng này.
                              </td>
                            </tr>
                          );
                        }
                        return items.map((item, index) => {
                          const serveText = item.serveType === 'takeaway' ? 'Mang đi' : `Tại chỗ ${item.duration === '4h' ? '4 giờ' : 'cả ngày'}`;
                          const unitPrice = item.serveType === 'takeaway' ? 25000 : (item.duration === '4h' ? 35000 : 45000);
                          
                          return (
                            <tr key={index}>
                              {/* <td style={{ textAlign: 'center', fontSize: '14px' }}>{String(index + 1).padStart(2, '0')}</td> */}
                              <td>
                                <div style={{ fontWeight: 600, fontSize: '15px', color: '#111' }}>{item.name}</div>
                                <div style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>{serveText}</div>
                              </td>
                              <td style={{ textAlign: 'right', fontSize: '14px' }}>{unitPrice.toLocaleString('vi-VN')}đ</td>
                              <td style={{ textAlign: 'center', fontSize: '14px' }}>{String(item.quantity).padStart(2, '0')}</td>
                              <td style={{ textAlign: 'right', fontSize: '14px' }} className="font-bold">
                                {(unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="tables-sheet-footer">
              <div className="tables-sheet-total-row">
                <span>Tổng cộng đơn:</span>
                <span className="tables-total-price">
                  {(() => {
                    let items = decodeOrderIdToItems(selectedSessionForDetail.orderId, productList);
                    if (items.length === 0) {
                      const metadata = ordersMetadata[selectedSessionForDetail.orderId];
                      items = metadata?.items || [];
                    }
                    const total = items.reduce((sum, item) => {
                      const unitPrice = item.serveType === 'takeaway' ? 25000 : (item.duration === '4h' ? 35000 : 45000);
                      return sum + (unitPrice * item.quantity);
                    }, 0);
                    return total > 0 ? `${total.toLocaleString('vi-VN')}đ` : 'Chưa tính';
                  })()}
                </span>
              </div>
              <div className="tables-sheet-actions" style={{ display: 'flex', gap: '10px' }}>
                {(() => {
                  const diffMs = parseServerDate(selectedSessionForDetail.endTime).getTime() - parseServerDate(selectedSessionForDetail.startTime).getTime();
                  const is4h = [4, 8, 12, 16, 20, 24].some(h => Math.abs(diffMs - h * 60 * 60 * 1000) < 60000);
                  if (is4h) {
                    return (
                      <button 
                        className="tables-btn-checkout"
                        onClick={() => navigate('/pos/sales', { state: { lockedCardNumber: selectedSessionForDetail.card.cardNumber } })}
                        style={{ flex: 1, backgroundColor: '#eef8e6', color: '#349409', border: '1px solid #349409' }}
                      >
                        + THÊM MÓN
                      </button>
                    );
                  }
                  return null;
                })()}
                <button 
                  className="tables-btn-checkout"
                  style={{ flex: 1 }}
                  onClick={() => handleRelease(selectedSessionForDetail.card.cardNumber)}
                >
                  TRẢ THẺ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Release Popup */}
      {releaseConfirmCard && (
        <div className="tables-modal-overlay" onClick={() => setReleaseConfirmCard(null)}>
          <div className="tables-confirm-box" onClick={e => e.stopPropagation()}>
            <h3 className="tables-confirm-title">Xác nhận trả thẻ</h3>
            <p className="tables-confirm-message">
              Bạn có chắc chắn muốn trả thẻ số <strong style={{ color: '#349409' }}>#{releaseConfirmCard}</strong> không?
            </p>
            {releaseError && (
              <p style={{ color: '#d32f2f', fontSize: '13px', textAlign: 'center', margin: '0 0 12px 0' }}>{releaseError}</p>
            )}
            <div className="tables-confirm-actions">
              <button
                className="tables-confirm-cancel"
                onClick={() => setReleaseConfirmCard(null)}
                disabled={releaseLoading}
              >
                HỦY
              </button>
              <button
                className="tables-confirm-ok"
                onClick={handleReleaseConfirmed}
                disabled={releaseLoading}
              >
                {releaseLoading ? 'Đang xử lý...' : 'XÁC NHẬN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Release Popup */}
      {releaseSuccessCard && (
        <div className="tables-modal-overlay" onClick={() => setReleaseSuccessCard(null)}>
          <div className="tables-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="tables-success-icon">✓</div>
            <h3 className="tables-confirm-title" style={{ color: '#349409' }}>Trả thẻ thành công!</h3>
            <p className="tables-confirm-message">
              Thẻ số <strong style={{ color: '#349409' }}>#{releaseSuccessCard}</strong> đã được hoàn trả thành công.
            </p>
            <button
              className="tables-confirm-ok"
              style={{ width: '100%' }}
              onClick={() => setReleaseSuccessCard(null)}
            >
              ĐÓNG
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
