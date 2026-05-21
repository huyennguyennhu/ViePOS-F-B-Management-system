import { useState, useEffect } from 'react';
import { cardAPI } from '../services/api';
import { CreditCard, Clock, Lock, Unlock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
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

export default function PosTablesPage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'sessions'>('cards');
  const [cards, setCards] = useState<Card[]>([]);
  const [sessions, setSessions] = useState<CardSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        { id: 1, cardNumber: '06', status: 'trống' },
        { id: 2, cardNumber: '09', status: 'Đang sử dụng' },
        { id: 3, cardNumber: '10', status: 'trống' },
        { id: 4, cardNumber: '11', status: 'khóa' },
        { id: 5, cardNumber: '12', status: 'trống' },
        { id: 6, cardNumber: '14', status: 'trống' },
        { id: 7, cardNumber: '15', status: 'trống' },
        { id: 8, cardNumber: '17', status: 'quá giờ' },
        { id: 9, cardNumber: '20', status: 'trống' },
        { id: 10, cardNumber: '21', status: 'trống' },
        { id: 11, cardNumber: '23', status: 'trống' },
        { id: 12, cardNumber: '25', status: 'trống' },
      ]);

      const now = new Date();
      const back4h = new Date(now.getTime() - 4.5 * 60 * 60 * 1000);
      const end4h = new Date(back4h.getTime() + 4 * 60 * 60 * 1000);
      
      const back2h = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const end2h = new Date(back2h.getTime() + 4 * 60 * 60 * 1000);

      setSessions([
        {
          id: 1,
          card: { id: 8, cardNumber: '17', status: 'quá giờ' },
          startTime: back4h.toISOString(),
          endTime: end4h.toISOString(),
          actualEndTime: null,
          orderId: 'ORD-987654321',
          status: 'Quá giờ'
        },
        {
          id: 2,
          card: { id: 2, cardNumber: '09', status: 'Đang sử dụng' },
          startTime: back2h.toISOString(),
          endTime: end2h.toISOString(),
          actualEndTime: null,
          orderId: 'ORD-123456789',
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

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'trống': return 'Trống';
      case 'đang sử dụng': return 'Đang sử dụng';
      case 'quá giờ': return 'Quá giờ';
      case 'khóa': return 'Đã khóa';
      default: return status;
    }
  };

  return (
    <div className="pos-tables-page">
      {/* Header */}
      <div className="tables-header">
        <h1 className="tables-header-title">Quản Lý Thẻ & Session</h1>
        <button className="btn-refresh" onClick={fetchData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {errorMessage && (
        <div className="tables-alert-warning">
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="tables-tabs">
        <button 
          className={`tables-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          <CreditCard size={18} />
          Danh sách thẻ ({cards.length})
        </button>
        <button 
          className={`tables-tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Clock size={18} />
          Phiên sử dụng ({sessions.filter(s => s.status !== 'Hoàn thành').length} hoạt động)
        </button>
      </div>

      {/* Content */}
      <div className="tables-tab-content">
        {activeTab === 'cards' ? (
          <div className="cards-grid">
            {cards.map(card => {
              const statusClass = card.status === 'Đang sử dụng' ? 'in-use' : 
                                  card.status === 'quá giờ' ? 'overdue' : 
                                  card.status === 'khóa' ? 'locked' : 'free';
              return (
                <div key={card.id} className={`card-item-box ${statusClass}`}>
                  <div className="card-item-num">{card.cardNumber}</div>
                  <div className="card-item-status-badge">
                    {card.status === 'trống' && <CheckCircle size={12} />}
                    {card.status === 'quá giờ' && <AlertTriangle size={12} />}
                    {card.status === 'khóa' && <Lock size={12} />}
                    <span>{getStatusText(card.status)}</span>
                  </div>
                  
                  <div className="card-item-actions">
                    {(card.status === 'Đang sử dụng' || card.status === 'quá giờ') ? (
                      <button 
                        className="btn-card-action release"
                        onClick={() => handleRelease(card.cardNumber)}
                      >
                        Trả thẻ
                      </button>
                    ) : (
                      <button 
                        className={`btn-card-action lock ${card.status === 'khóa' ? 'unlock-btn' : ''}`}
                        onClick={() => handleToggleLock(card)}
                      >
                        {card.status === 'khóa' ? <Unlock size={14} /> : <Lock size={14} />}
                        {card.status === 'khóa' ? 'Mở khóa' : 'Khóa'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="sessions-list-wrapper">
            {sessions.length === 0 ? (
              <div className="no-sessions">Không có phiên sử dụng nào.</div>
            ) : (
              <div className="sessions-table-container">
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>Thẻ</th>
                      <th>Đơn hàng</th>
                      <th>Bắt đầu</th>
                      <th>Kết thúc dự kiến</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(session => {
                      const isSessionActive = session.status === 'Đang sử dụng' || session.status === 'Quá giờ';
                      return (
                        <tr key={session.id} className={session.status === 'Quá giờ' ? 'row-overdue' : ''}>
                          <td>
                            <span className="session-card-badge">{session.card.cardNumber}</span>
                          </td>
                          <td><span className="session-order-id">{session.orderId}</span></td>
                          <td>{formatDateTime(session.startTime)}</td>
                          <td>{formatDateTime(session.endTime)}</td>
                          <td>
                            <span className={`session-status-tag ${session.status.toLowerCase().replace(' ', '-')}`}>
                              {session.status}
                            </span>
                          </td>
                          <td>
                            {isSessionActive && (
                              <button 
                                className="session-release-btn"
                                onClick={() => handleRelease(session.card.cardNumber)}
                              >
                                Trả thẻ
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
