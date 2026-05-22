import { useState, useEffect } from 'react';
import { cardAPI } from '../services/api';
import { X } from 'lucide-react';
import listDarkIcon from '../../assets/icon/list_dark.png';
import './PosOrdersPage.css';
import './PosTablesPage.css';
import { useNavigate } from 'react-router-dom';

const parseServerDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const hasZ = dateStr.endsWith('Z');
  const hasOffset = /([+-]\d{2}:\d{2})$/.test(dateStr);
  const formattedStr = (hasZ || hasOffset) ? dateStr : `${dateStr}Z`;
  return new Date(formattedStr);
};

export default function PosOrdersPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersMetadata, setOrdersMetadata] = useState<any>({});
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedCardForPopup, setSelectedCardForPopup] = useState<any>(null);
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const currentStaffEmail = localStorage.getItem('staffEmail');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await cardAPI.getSessions();
        const activeSessions = Array.isArray(res.data) ? res.data : [];
        
        const savedHistory = localStorage.getItem('pos_order_history');
        const historyData = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Filter by creator
        const myOrders = historyData.filter((order: any) => order.creator === currentStaffEmail);

        // Sort by createdAt descending
        myOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Enrich with real-time session info for timers and status
        const enrichedOrders = myOrders.map((order: any) => {
          if (order.cardNumber === 'Mang đi') {
             return {
                ...order,
                orderId: order.id,
                startTime: order.createdAt,
                status: 'Hoàn thành'
             };
          }
          
          const session = activeSessions.find(s => s.orderId === order.parentOrderId);
          if (session) {
             return {
               ...order,
               orderId: order.id,
               startTime: order.createdAt,
               endTime: session.endTime,
               actualEndTime: session.actualEndTime,
               status: session.status,
               card: session.card,
               sessionData: session // Full session for popup
             };
          }
          
          return {
             ...order,
             orderId: order.id,
             startTime: order.createdAt,
             card: { cardNumber: order.cardNumber }
          };
        });

        setSessions(enrichedOrders);
      } catch (err) {
        console.error("Lỗi khi tải danh sách đơn hàng", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentStaffEmail]);

  const getStatusBadge = (status: string, endTime?: string, actualEndTime?: string) => {
    if (status === 'Hoàn thành' || actualEndTime) {
      return <span className="order-badge completed">Hoàn thành</span>;
    }
    
    if (endTime) {
      const remainingTimeMs = parseServerDate(endTime).getTime() - currentTime.getTime();
      if (remainingTimeMs < 0) {
        return <span className="order-badge overdue">Quá giờ</span>;
      }
    }
    
    return <span className="order-badge active">{status || 'Đang sử dụng'}</span>;
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum: number, item: any) => {
      const unitPrice = item.serveType === 'takeaway' ? 25000 : (item.duration === '4h' ? 35000 : 45000);
      return sum + (unitPrice * item.quantity);
    }, 0);
  };

  const getTimerString = (session: any) => {
    const remainingTimeMs = parseServerDate(session.endTime).getTime() - currentTime.getTime();
    const isOverdue = remainingTimeMs < 0;
    const absMs = Math.abs(remainingTimeMs);
    const hours = Math.floor(absMs / (3600 * 1000));
    const mins = Math.floor((absMs % (3600 * 1000)) / (60 * 1000));
    const secs = Math.floor((absMs % (60 * 1000)) / 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const timeStr = `${pad(hours)} : ${pad(mins)} : ${pad(secs)}`;
    return isOverdue ? `-${timeStr}` : timeStr;
  };

  return (
    <div className="pos-orders-container">
      <div className="pos-orders-header" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', margin: 0 }}>Lịch sử đơn hàng</h2>
      </div>

      <div className="pos-orders-list-container">
        <div className="pos-orders-list-header">
          <div className="pos-orders-header-col">Mã Đơn</div>
          <div className="pos-orders-header-col">Ngày giờ</div>
          <div className="pos-orders-header-col">Tổng Tiền</div>
          <div className="pos-orders-header-col">Trạng Thái</div>
        </div>

        <div className="pos-orders-list-body">
          {sessions.length === 0 && !loading ? (
            <div className="pos-orders-empty" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Bạn chưa tạo đơn hàng nào.</div>
          ) : (
            sessions.map((session, idx) => {
              const items = session.items || [];
              const totalAmount = session.totalAmount || calculateTotal(items);
              const startDate = parseServerDate(session.startTime);
              
              return (
                <div key={`${session.id}-${idx}`} className="pos-orders-row" onClick={() => setSelectedOrder(session)}>
                  <div className="pos-orders-col" style={{ fontWeight: 600, color: '#33691e' }}>{session.displayId || session.orderId}</div>
                  <div className="pos-orders-col">{startDate.toLocaleDateString('vi-VN')} {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="pos-orders-col" style={{ fontWeight: 600 }}>{totalAmount > 0 ? `${totalAmount.toLocaleString('vi-VN')}đ` : '-'}</div>
                  <div className="pos-orders-col">{getStatusBadge(session.status, session.endTime, session.actualEndTime)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Details Popup */}
      {selectedOrder && (
        <div className="pos-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="pos-modal-content tables-sheet-content" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="tables-sheet-header">
              <h2 className="tables-sheet-title">
                <span style={{ color: '#33691e' }}>#{selectedOrder.orderId}</span>
              </h2>
              <button className="tables-sheet-close" onClick={() => setSelectedOrder(null)}>
                <X size={24} color="#111" />
              </button>
            </div>
            
            <div className="tables-sheet-body" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: '12px', columnGap: '8px', alignItems: 'center', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' }}>
                <span className="tables-info-label">Ngày giờ:</span>
                <span className="tables-info-value">
                  {parseServerDate(selectedOrder.startTime).toLocaleDateString('vi-VN')} - {parseServerDate(selectedOrder.startTime).toLocaleTimeString('vi-VN')}
                </span>

                <span className="tables-info-label">Trạng thái:</span>
                <span className="tables-info-value">{getStatusBadge(selectedOrder.status, selectedOrder.endTime, selectedOrder.actualEndTime)}</span>

                <span className="tables-info-label">Thanh toán:</span>
                <span className="tables-info-value" style={{ color: '#111' }}>{selectedOrder.paymentMethod || 'Tiền mặt'}</span>

                <span className="tables-info-label">Số thẻ:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="tables-info-value" style={{ color: '#33691e', fontWeight: 800 }}>#{selectedOrder.card?.cardNumber || selectedOrder.cardNumber}</span>
                  {(selectedOrder.cardNumber !== 'Mang đi' && selectedOrder.sessionData) && (
                    <button 
                      title="Chi tiết thẻ"
                      onClick={() => {
                        setSelectedCardForPopup(selectedOrder.sessionData);
                        setSelectedOrder(null);
                      }}
                      style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer', display: 'flex' }}
                    >
                      <img src={listDarkIcon} alt="Detail" style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>
              </div>

              <div className="tables-products-section" style={{ padding: '0 20px 20px' }}>
                <h3 className="tables-section-title" style={{ marginTop: '10px' }}>Danh sách món nước & dịch vụ</h3>
                <div className="tables-products-table-wrapper" style={{ maxHeight: '300px' }}>
                  <table className="tables-products-table">
                    <thead>
                      <tr>
                        <th>SẢN PHẨM</th>
                        <th style={{ width: '65px', textAlign: 'right' }}>GIÁ</th>
                        <th style={{ width: '30px', textAlign: 'center' }}>SL</th>
                        <th style={{ width: '70px', textAlign: 'right' }}>TỔNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const items = selectedOrder.items || [];
                        if (items.length === 0) {
                          return <tr><td colSpan={4} className="tables-no-products" style={{ backgroundColor: 'transparent' }}>Không có thông tin món</td></tr>;
                        }
                        return items.map((item: any, idx: number) => {
                          const unitPrice = item.serveType === 'takeaway' ? 25000 : (item.duration === '4h' ? 35000 : 45000);
                          const serveText = item.serveType === 'takeaway' ? 'Mang đi' : `Tại chỗ ${item.duration === '4h' ? '4 giờ' : 'cả ngày'}`;
                          return (
                            <tr key={idx}>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{item.name}</div>
                                <div style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>{serveText}</div>
                              </td>
                              <td style={{ textAlign: 'right', fontSize: '13px' }}>{unitPrice.toLocaleString('vi-VN')}đ</td>
                              <td style={{ textAlign: 'center', fontSize: '13px' }}>{String(item.quantity).padStart(2, '0')}</td>
                              <td style={{ textAlign: 'right', fontSize: '13px' }} className="font-bold">{(unitPrice * item.quantity).toLocaleString('vi-VN')}đ</td>
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
                <span>Tổng cộng:</span>
                <span className="tables-total-price">
                  {(selectedOrder.totalAmount || calculateTotal(selectedOrder.items || [])).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Popup (Same as PosTablesPage's popup) */}
      {selectedCardForPopup && (
        <div className="tables-modal-overlay" onClick={() => setSelectedCardForPopup(null)}>
          <div className="tables-detail-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="tables-sheet-header">
              <h2 className="tables-sheet-title" style={{ color: '#349409', fontSize: '24px' }}>#{selectedCardForPopup.card?.cardNumber}</h2>
              <button className="tables-sheet-close" onClick={() => setSelectedCardForPopup(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="tables-sheet-body">
              <div className="tables-detail-info-grid">
                <div className="tables-info-item">
                  <span className="tables-info-label">Ngày:</span>
                  <span className="tables-info-value">
                    {parseServerDate(selectedCardForPopup.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <div className="tables-info-item">
                  <span className="tables-info-label">Giờ vào:</span>
                  <span className="tables-info-value">
                    {parseServerDate(selectedCardForPopup.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {(() => {
                  const diffMs = parseServerDate(selectedCardForPopup.endTime).getTime() - parseServerDate(selectedCardForPopup.startTime).getTime();
                  const is4h = [4, 8, 12, 16, 20, 24].some(h => Math.abs(diffMs - h * 60 * 60 * 1000) < 60000);
                  if (!is4h) return null;
                  
                  return (
                    <>
                      <div className="tables-info-item">
                        <span className="tables-info-label">Dự kiến ra:</span>
                        <span className="tables-info-value">
                          {parseServerDate(selectedCardForPopup.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="tables-info-item">
                        <span className="tables-info-label">Thời gian còn lại:</span>
                        <span className="tables-info-value" style={{ color: '#C42326', fontWeight: 800, fontSize: '16px' }}>
                          {getTimerString(selectedCardForPopup)}
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
                        <th>SẢN PHẨM</th>
                        <th style={{ width: '65px', textAlign: 'right' }}>GIÁ</th>
                        <th style={{ width: '30px', textAlign: 'center' }}>SL</th>
                        <th style={{ width: '70px', textAlign: 'right' }}>TỔNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const items = ordersMetadata[selectedCardForPopup.orderId]?.items || [];
                        if (items.length === 0) {
                          return (
                            <tr>
                              <td colSpan={4} className="tables-no-products" style={{ backgroundColor: 'transparent' }}>
                                Chưa có thông tin chi tiết món cho đơn hàng này.
                              </td>
                            </tr>
                          );
                        }
                        return items.map((item: any, index: number) => {
                          const serveText = item.serveType === 'takeaway' ? 'Mang đi' : `Tại chỗ ${item.duration === '4h' ? '4 giờ' : 'cả ngày'}`;
                          const unitPrice = item.serveType === 'takeaway' ? 25000 : (item.duration === '4h' ? 35000 : 45000);
                          
                          return (
                            <tr key={index}>
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
                    const items = ordersMetadata[selectedCardForPopup.orderId]?.items || [];
                    const total = items.reduce((sum, item: any) => {
                      const unitPrice = item.serveType === 'takeaway' ? 25000 : (item.duration === '4h' ? 35000 : 45000);
                      return sum + (unitPrice * item.quantity);
                    }, 0);
                    return total > 0 ? `${total.toLocaleString('vi-VN')}đ` : 'Chưa tính';
                  })()}
                </span>
              </div>
              <div className="tables-sheet-actions" style={{ display: 'flex', gap: '10px' }}>
                {(() => {
                  const diffMs = parseServerDate(selectedCardForPopup.endTime).getTime() - parseServerDate(selectedCardForPopup.startTime).getTime();
                  const is4h = [4, 8, 12, 16, 20, 24].some(h => Math.abs(diffMs - h * 60 * 60 * 1000) < 60000);
                  if (is4h) {
                    return (
                      <button 
                        className="tables-btn-checkout"
                        onClick={() => navigate('/pos/sales', { state: { lockedCardNumber: selectedCardForPopup.card?.cardNumber } })}
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
                  onClick={() => navigate('/pos/tables', { state: { openCardNumber: selectedCardForPopup.card?.cardNumber } })}
                >
                  TRẢ THẺ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
