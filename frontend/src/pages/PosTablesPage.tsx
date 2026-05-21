import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardAPI } from '../services/api';
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

// Custom SVG Icon for Settings Filter
/* const FilterSettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
); */

export default function PosTablesPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [sessions, setSessions] = useState<CardSession[]>([]);
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

  // Real-time ticking timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      const cardsRes = await cardAPI.getCards();
      const sessionsRes = await cardAPI.getSessions();
      
      // Sort cards by card number ascending
      const sortedCards = [...cardsRes.data].sort((a, b) => 
        parseInt(a.cardNumber) - parseInt(b.cardNumber)
      );
      setCards(sortedCards);
      
      // Sort sessions by start time descending
      const sortedSessions = [...sessionsRes.data].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
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
      // Card 04: Overdue by 2m 43s (started 4h ago, end 4h after start, but let's mock endTime to be exactly now - 2m 43s)
      const start4 = new Date(now.getTime() - (4 * 60 * 60 + 2 * 60 + 43) * 1000);
      const end4 = new Date(start4.getTime() + 4 * 60 * 60 * 1000); // overdue now
      
      // Card 08: Near overdue (remaining 14m 2s)
      const start8 = new Date(now.getTime() - (3 * 60 * 60 + 45 * 60 + 58) * 1000);
      const end8 = new Date(start8.getTime() + 4 * 60 * 60 * 1000); // 14m 2s left

      // Card 08 duplicate: Near overdue (remaining 14m 2s)
      const start8_2 = new Date(now.getTime() - (3 * 60 * 60 + 45 * 60 + 58) * 1000);
      const end8_2 = new Date(start8_2.getTime() + 4 * 60 * 60 * 1000);

      // Card 03: Green active 4H (started 5m 17s ago, 4h duration)
      const start3 = new Date(now.getTime() - (5 * 60 + 17) * 1000);
      const end3 = new Date(start3.getTime() + 4 * 60 * 60 * 1000); // 3h 54m 43s left

      // Card 03 duplicate: Green active Cả ngày (started 1h ago, all_day)
      const start3_2 = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      // All day end time is 22:00 today
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

  const handleRelease = async (cardNumber: string) => {
    const confirmRelease = window.confirm(`Bạn có chắc chắn muốn CHECK OUT (trả thẻ) số ${cardNumber}?`);
    if (!confirmRelease) return;
    try {
      await cardAPI.releaseCard(cardNumber);
      alert(`Đã trả thẻ số ${cardNumber} thành công!`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Không thể thực hiện trả thẻ.');
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
      // If filtering for active sessions or specific times, free/locked cards should be hidden
      return false;
    }

    const diffMs = new Date(activeSession.endTime).getTime() - new Date(activeSession.startTime).getTime();
    const is4h = Math.abs(diffMs - 4 * 60 * 60 * 1000) < 60000;
    const durationType = is4h ? '4h' : 'all_day';

    const remainingTimeMs = new Date(activeSession.endTime).getTime() - currentTime.getTime();
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
      const remainingTimeMs = new Date(activeSession.endTime).getTime() - currentTime.getTime();
      const isOverdue = remainingTimeMs < 0;
      const isNearOverdue = !isOverdue && remainingTimeMs <= 15 * 60 * 1000;

      if (isOverdue) return 1; // Quá giờ (Red)
      if (isNearOverdue) return 2; // Sắp hết giờ (Yellow)
      return 3; // Đang sử dụng (Green)
    }

    if (card.status === 'khóa') return 5; // Khóa (Grey)
    return 4; // Trống (Grey)
  };

  const sortedCards = [...filteredCards].sort((a, b) => {
    const weightA = getCardStatusWeight(a);
    const weightB = getCardStatusWeight(b);
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    // Secondary sort by card number ascending
    return parseInt(a.cardNumber) - parseInt(b.cardNumber);
  });

  return (
    <div className="pos-tables-page">
      {/* Centered Header with subtitle/action */}
      <div className="tables-header-centered">
        <div style={{ width: '36px' }}></div> {/* Spacer to align title center */}
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
        {/* <button className="tables-filter-btn" title="Bộ lọc">
          <FilterSettingsIcon />
        </button> */}
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
        <button className="pill-arrow-btn">
          <span>&rsaquo;</span>
        </button>
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
                const diffMs = new Date(activeSession.endTime).getTime() - new Date(activeSession.startTime).getTime();
                const is4h = Math.abs(diffMs - 4 * 60 * 60 * 1000) < 60000;
                durationType = is4h ? '4h' : 'all_day';

                const remainingTimeMs = new Date(activeSession.endTime).getTime() - currentTime.getTime();
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

                const startTimeStr = new Date(activeSession.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                
                // Get item count from metadata or fallback
                let itemCount = ordersMetadata[activeSession.orderId]?.itemCount;
                if (itemCount === undefined) {
                  // Fallbacks for mock/seeded sessions based on index / card number
                  if (card.cardNumber === '04') itemCount = 1;
                  else if (card.cardNumber === '08') itemCount = 2;
                  else if (card.cardNumber === '03') itemCount = 1;
                  else itemCount = 1; // general fallback
                }
                subText = `Vào lúc ${startTimeStr} | ${itemCount} món`;
              } else if (card.status === 'khóa') {
                statusColor = 'locked';
                badgeText = 'Đã khóa';
                timerStr = 'ĐÃ KHÓA';
              }

              // Use unique key considering duplicate cardNumbers in mock data
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
                          <button 
                            className="card-plus-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/pos/sales');
                            }}
                            title="Thêm món"
                          >
                            <Plus size={16} />
                          </button>
                          <button 
                            className="card-checkout-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRelease(card.cardNumber);
                            }}
                          >
                            CHECK OUT
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
              <h2 className="tables-sheet-title">Chi Tiết Bàn #{selectedSessionForDetail.card.cardNumber}</h2>
              <button className="tables-sheet-close" onClick={() => setSelectedSessionForDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="tables-sheet-body">
              <div className="tables-detail-info-grid">
                <div className="tables-info-item">
                  <span className="tables-info-label">Mã đơn hàng:</span>
                  <span className="tables-info-value font-mono">{selectedSessionForDetail.orderId}</span>
                </div>
                <div className="tables-info-item">
                  <span className="tables-info-label">Giờ vào:</span>
                  <span className="tables-info-value">
                    {new Date(selectedSessionForDetail.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="tables-info-item">
                  <span className="tables-info-label">Dự kiến ra:</span>
                  <span className="tables-info-value">
                    {new Date(selectedSessionForDetail.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="tables-info-item">
                  <span className="tables-info-label">Thời gian còn lại:</span>
                  <span className="tables-info-value font-bold">
                    {(() => {
                      const remainingTimeMs = new Date(selectedSessionForDetail.endTime).getTime() - currentTime.getTime();
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
              </div>

              <div className="tables-products-section">
                <h3 className="tables-section-title">Danh sách món nước & dịch vụ</h3>
                <div className="tables-products-table-wrapper">
                  <table className="tables-products-table">
                    <thead>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <th>Loại phục vụ</th>
                        <th style={{ textAlign: 'center' }}>SL</th>
                        <th style={{ textAlign: 'right' }}>Đơn giá</th>
                        <th style={{ textAlign: 'right' }}>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const metadata = ordersMetadata[selectedSessionForDetail.orderId];
                        const items = metadata?.items || [];
                        if (items.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="tables-no-products">
                                Chưa có thông tin chi tiết món cho đơn hàng này.
                              </td>
                            </tr>
                          );
                        }
                        return items.map((item, index) => {
                          const is4h = item.serveType === 'dine_in' && item.duration === '4h';
                          return (
                            <tr key={index} className={is4h ? 'row-highlight-4h' : ''}>
                              <td className="font-semibold">{item.name}</td>
                              <td>
                                {item.serveType === 'takeaway' ? 'Mang đi' : `Tại chỗ (${item.duration === '4h' ? '4H' : 'Cả ngày'})`}
                              </td>
                              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                              <td style={{ textAlign: 'right' }}>{item.price.toLocaleString('vi-VN')}đ</td>
                              <td style={{ textAlign: 'right' }} className="font-bold">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
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
                    const metadata = ordersMetadata[selectedSessionForDetail.orderId];
                    const items = metadata?.items || [];
                    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    return total > 0 ? `${total.toLocaleString('vi-VN')}đ` : 'Chưa tính';
                  })()}
                </span>
              </div>
              <div className="tables-sheet-actions">
                <button 
                  className="tables-btn-checkout"
                  onClick={() => {
                    handleRelease(selectedSessionForDetail.card.cardNumber);
                    setSelectedSessionForDetail(null);
                  }}
                >
                  CHECK OUT (TRẢ THẺ)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
